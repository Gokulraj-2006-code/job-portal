import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, Globe } from 'lucide-react';
import { companyService } from '../services/companyService';
import JobCard from '../components/jobs/JobCard';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [companyData, jobData] = await Promise.all([
          companyService.getCompany(id),
          companyService.getCompanyJobs(id),
        ]);
        if (isMounted) {
          setCompany(companyData);
          setJobs(jobData.map((job) => ({ ...job, company: companyData })));
        }
      } catch (error) {
        if (isMounted) setCompany(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="container-custom py-16 text-center text-slate-500 dark:text-slate-400">Loading company...</div>;
  }

  if (!company) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-slate-500 mb-4 dark:text-slate-400">This company could not be found.</p>
        <Link to="/companies" className="btn-primary inline-block">Back to Companies</Link>
      </div>
    );
  }

  return (
    <div className="page-company-details container-custom py-8">
      <div className="card p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-primary-900/40">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-10 h-10 rounded" />
            ) : (
              <Building className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{company.industry}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
              {company.location && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{company.location}</span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                  <Globe className="w-4 h-4" />{company.website}
                </a>
              )}
            </div>
          </div>
        </div>
        {company.description && (
          <p className="text-slate-600 mt-6 dark:text-slate-300">{company.description}</p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Open Roles at {company.name} ({jobs.length})</h2>
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No open roles right now — check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;
