// src/components/JobCard.jsx
import React from 'react';
import { Building, MapPin, Briefcase, DollarSign, Clock, Heart, GraduationCap } from 'lucide-react';
import { formatDate, formatSalary } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import AuthGateLink from '../AuthGateLink';

const JobCard = ({ job }) => {
  const { isAuthenticated } = useAuth();
  const { savedJobs, toggleSaveJob } = useJobs();
  const isSaved = savedJobs.includes(job.id);

  return (
    <div className="card job-card p-6 hover:border-primary-300 transition-all">
      <div className="job-card-top flex items-start justify-between">
        <div className="job-card-head flex items-start gap-4">
          <div className="job-card-logo w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-primary-900/40">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.name} className="w-8 h-8 rounded" />
            ) : (
              <Building className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div>
            <AuthGateLink to={`/jobs/${job.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary-600 transition">
                {job.title}
              </h3>
            </AuthGateLink>
            <p className="text-slate-600 dark:text-slate-300">{job.company?.name}</p>
          </div>
        </div>
        <button
          onClick={() => isAuthenticated && toggleSaveJob(job.id)}
          className={`job-card-save p-2 rounded-lg transition ${
            isSaved ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      <div className="job-card-meta flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="w-4 h-4" />
          {job.type}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="w-4 h-4" />
          {job.experienceLevel}
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <DollarSign className="w-4 h-4" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <Clock className="w-4 h-4" />
          {formatDate(job.createdAt)}
        </span>
      </div>

      <div className="job-card-skills flex flex-wrap gap-2 mt-4">
        {job.skills?.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full dark:bg-primary-900/40 dark:text-primary-300"
          >
            {skill}
          </span>
        ))}
        {job.skills?.length > 3 && (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full dark:bg-slate-700 dark:text-slate-300">
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      <div className="job-card-footer flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {job.applicants} applicants
        </span>
        <AuthGateLink
          to={`/jobs/${job.id}`}
          className="btn-3d job-card-apply"
        >
          Apply Now
        </AuthGateLink>
      </div>
    </div>
  );
};

export default JobCard;