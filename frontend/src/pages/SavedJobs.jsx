import React, { useEffect, useState } from 'react';
import { useJobs } from '../context/JobContext';
import JobCard from '../components/jobs/JobCard';
import { jobService } from '../services/jobService';

const SavedJobs = () => {
  const { savedJobs } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await jobService.getSavedJobs();
        if (isMounted) setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (isMounted) setJobs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [savedJobs]);

  return (
    <div className="page-dashboard-saved-jobs">
      <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-800" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">You haven&apos;t saved any jobs yet</p>
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

export default SavedJobs;
