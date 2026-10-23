import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [jobsData, appsData] = await Promise.all([
          jobService.getRecruiterJobs(),
          jobService.getRecruiterApplications(),
        ]);
        if (isMounted) {
          setJobs(jobsData);
          setApplications(appsData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;

  const statCards = [
    { label: 'Total Jobs Posted', value: jobs.length, icon: Briefcase, link: '/recruiter/jobs', color: 'text-blue-600' },
    { label: 'Active Postings', value: activeJobs, icon: CheckCircle, link: '/recruiter/jobs', color: 'text-emerald-600' },
    { label: 'Pending Approval', value: pendingJobs, icon: Clock, link: '/recruiter/jobs', color: 'text-amber-600' },
    { label: 'Total Applicants', value: applications.length, icon: Users, link: '/recruiter/applications', color: 'text-purple-600' },
  ];

  return (
    <div className="page-recruiter-overview">
      <h1 className="text-2xl font-bold mb-6">Recruiter Overview</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold">Welcome back, {user?.name}!</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          {user?.companyName || 'Your company'} · {user?.designation || 'Recruiter'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, link, color }) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition dark:bg-slate-800 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{value}</p>
                )}
              </div>
              <div className={`w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-white ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
