import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import JobCard from '../components/jobs/JobCard';
import { companyService } from '../services/companyService';
import { jobService } from '../services/jobService';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
// Filters sidebar
// JobFilter used to live in its own file under src/components/jobs — it was
// only ever used on this page, so it now lives in this one "main" file.
// ---------------------------------------------------------------------------
const JobFilter = ({ filters, onFilterChange, onClear }) => {
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

  const [categories, setCategories] = useState(['All']);
  const [experienceLevels, setExperienceLevels] = useState(['All']);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([jobService.getCategories(), jobService.getExperienceLevels()]).then(
      ([cats, levels]) => {
        if (isMounted) {
          setCategories(['All', ...cats]);
          setExperienceLevels(['All', ...levels]);
        }
      }
    );
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const data = await companyService.getCompanies();
        if (isMounted) {
          setAllCompanies(data);
        }
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const filteredCompanies = filters.category && filters.category !== 'All'
    ? allCompanies.filter(company =>
        company.industry === filters.category ||
        company.name.toLowerCase().includes(filters.category.toLowerCase())
      )
    : allCompanies;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-20 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="font-semibold text-lg mb-6">Filters</h3>

      <div className="mb-6">
        <label className="label-text">Category</label>
        <select
          value={filters.category || 'All'}
          onChange={(e) => handleChange('category', e.target.value)}
          className="input-field"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="label-text">Company</label>
        <select
          value={filters.company || 'All'}
          onChange={(e) => handleChange('company', e.target.value)}
          className="input-field"
          disabled={loading}
        >
          <option value="All">All Companies</option>
          {filteredCompanies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
        {loading && <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">Loading companies...</p>}
      </div>

      <div className="mb-6">
        <label className="label-text">Job Type</label>
        <select
          value={filters.type || 'All'}
          onChange={(e) => handleChange('type', e.target.value)}
          className="input-field"
        >
          {jobTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="label-text">Experience Level</label>
        <select
          value={filters.experienceLevel || 'All'}
          onChange={(e) => handleChange('experienceLevel', e.target.value)}
          className="input-field"
        >
          {experienceLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="label-text">Remote</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.remote || false}
            onChange={(e) => handleChange('remote', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">Remote only</span>
        </div>
      </div>

      <div>
        <label className="label-text">Salary Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.salaryMin || ''}
            onChange={(e) => handleChange('salaryMin', Number(e.target.value))}
            className="input-field w-1/2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salaryMax || ''}
            onChange={(e) => handleChange('salaryMax', Number(e.target.value))}
            className="input-field w-1/2"
          />
        </div>
      </div>

      <button
        onClick={onClear}
        className="w-full mt-6 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1 transition"
      >
        <X className="w-4 h-4" />
        Clear all filters
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Jobs page
// ---------------------------------------------------------------------------
const Jobs = () => {
  const { jobs, loading, fetchJobs, filters, setFilters } = useJobs();
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchParams] = useSearchParams();

  // Pick up a search query passed in via the URL (e.g. from the header search bar)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setFilters((prev) => ({ ...prev, search: q }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchJobs is recreated (via useCallback) whenever `filters` changes,
  // so depending on fetchJobs here means every filter change re-queries.
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Whenever the results change (new search/filter), reset back to the first page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [jobs]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  return (
    <div className="page-jobs container-custom py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Jobs</h1>
          <p className="text-slate-600 mt-1 dark:text-slate-300">
            {jobs.length} jobs found across all companies
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn-secondary flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-4 lg:gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <JobFilter filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
        </div>

        {/* Jobs List */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-800" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl dark:bg-slate-900">
              <p className="text-slate-500 dark:text-slate-400">No jobs found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    More Jobs
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
