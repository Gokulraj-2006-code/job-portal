import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building, MapPin, Briefcase, DollarSign, Clock, GraduationCap } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatSalary } from '../utils/helpers';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const { getJob } = useJobs();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getJob(id);
        if (isMounted) setJob(data);
      } catch (error) {
        if (isMounted) setJob(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to apply');
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${id}/apply`)}`);
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  if (loading) {
    return <div className="container-custom py-16 text-center text-slate-500 dark:text-slate-400">Loading job...</div>;
  }

  if (!job) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-slate-500 mb-4 dark:text-slate-400">This job could not be found.</p>
        <Link to="/jobs" className="btn-primary inline-block">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="page-job-details container-custom py-8 max-w-4xl">
      <div className="card p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-primary-900/40">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded" />
            ) : (
              <Building className="w-7 h-7 text-primary-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-slate-600 dark:text-slate-300">{job.company?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.type}</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" />{job.experienceLevel}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <DollarSign className="w-4 h-4" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500"><Clock className="w-4 h-4" />{formatDate(job.createdAt)}</span>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-2">Job Description</h2>
          <p className="text-slate-600 whitespace-pre-line dark:text-slate-300">{job.description}</p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full dark:bg-primary-900/40 dark:text-primary-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleApply}
          className="btn-3d mt-8"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
