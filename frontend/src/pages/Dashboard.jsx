import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { Heart, Bell, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { savedJobs } = useJobs();
  const [stats, setStats] = useState({ applications: 0, saved: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API
        // For now, use mock data
        const applications = JSON.parse(localStorage.getItem('jp_applications') || '[]');
        const notifications = JSON.parse(localStorage.getItem('jp_notifications') || '[]');

        if (isMounted) {
          setStats({
            applications: applications.filter(a => a.seekerId === user?.id).length,
            saved: savedJobs?.length || 0,
            notifications: notifications.filter(n => n.userId === user?.id && !n.read).length,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user?.id, savedJobs]);

  const statCards = [
    { label: 'Applications', value: stats.applications, icon: FileText, link: '/applied-jobs', color: 'text-blue-600' },
    { label: 'Saved Jobs', value: stats.saved, icon: Heart, link: '/dashboard/saved-jobs', color: 'text-red-600' },
    { label: 'Notifications', value: stats.notifications, icon: Bell, link: '/dashboard/notifications', color: 'text-amber-600' },
  ];

  return (
    <div className="page-dashboard-overview">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold">Welcome back, {user?.name}!</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          {user?.headline || 'Update your profile to let recruiters find you.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
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

export default Dashboard;
