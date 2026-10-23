import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Building, FileText, Clock, Loader2 } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      adminService.getStats(),
      adminService.getRecentApplications(5),
      adminService.getRecentUsers(5),
      adminService.getCompanyWiseStats(),
    ]).then(([s, apps, users, companies]) => {
      if (!isMounted) return;
      setStats(s);
      setRecentApplications(apps);
      setRecentUsers(users);
      setCompanyStats(companies);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !stats) {
    return <div className="text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Job Seekers', value: stats.totalSeekers, icon: Users, link: '/admin/users', color: 'text-blue-600' },
    { label: 'Companies', value: stats.totalCompanies, icon: Building, link: '/admin/companies', color: 'text-emerald-600' },
    { label: 'Jobs Posted', value: stats.totalJobs, icon: Briefcase, link: '/admin/jobs', color: 'text-purple-600' },
    { label: 'Applications', value: stats.totalApplications, icon: FileText, link: '/admin/applications', color: 'text-amber-600' },
  ];

  const chartTextColor = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155';

  const jobStatusData = {
    labels: ['Active', 'Pending Approval', 'Rejected'],
    datasets: [
      {
        data: [stats.activeJobs, stats.pendingJobs, stats.rejectedJobs],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const companyBarData = {
    labels: companyStats.map((c) => c.name),
    datasets: [
      {
        label: 'Jobs Posted',
        data: companyStats.map((c) => c.jobCount),
        backgroundColor: '#4f46e5',
      },
      {
        label: 'Applications',
        data: companyStats.map((c) => c.applicationCount),
        backgroundColor: '#818cf8',
      },
    ],
  };

  return (
    <div className="page-admin-overview">
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>

      {(stats.pendingJobs > 0 || stats.pendingCompanies > 0) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 text-sm dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-300">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {stats.pendingJobs > 0 && <>{stats.pendingJobs} job(s) awaiting approval. </>}
            {stats.pendingCompanies > 0 && <>{stats.pendingCompanies} compan{stats.pendingCompanies === 1 ? 'y' : 'ies'} awaiting approval.</>}
          </span>
          <Link to="/admin/jobs" className="underline font-medium">Review jobs</Link>
          <Link to="/admin/companies" className="underline font-medium">Review companies</Link>
        </div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-semibold mb-4">Job Status Breakdown</h2>
          <div className="max-w-xs mx-auto">
            <Doughnut
              data={jobStatusData}
              options={{ plugins: { legend: { labels: { color: chartTextColor } } } }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-semibold mb-4">Company-wise Jobs &amp; Applications</h2>
          <Bar
            data={companyBarData}
            options={{
              scales: {
                x: { ticks: { color: chartTextColor }, grid: { display: false } },
                y: { ticks: { color: chartTextColor }, beginAtZero: true },
              },
              plugins: { legend: { labels: { color: chartTextColor } } },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">View all</Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{app.seeker?.name || 'Unknown'}</p>
                    <p className="text-slate-500 dark:text-slate-400">{app.job?.title}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(app.appliedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recently Registered Users</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">View all</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 capitalize">{u.role}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(u.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company-wise Job Listings table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
        <h2 className="font-semibold mb-4">Company-wise Job Listings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-2 pr-4">Company</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Jobs Posted</th>
                <th className="pb-2">Applications</th>
              </tr>
            </thead>
            <tbody>
              {companyStats.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="py-2 pr-4 font-medium">{c.name}</td>
                  <td className="py-2 pr-4 capitalize">{c.status}</td>
                  <td className="py-2 pr-4">{c.jobCount}</td>
                  <td className="py-2">{c.applicationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
