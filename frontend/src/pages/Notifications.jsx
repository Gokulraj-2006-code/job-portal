import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { userService } from '../services/userService';
import { formatDate } from '../utils/helpers';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await userService.getNotifications();
        if (isMounted) setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRead = async (id) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      // silently ignore
    }
  };

  return (
    <div className="page-dashboard-notifications">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition ${
                n.read ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800' : 'bg-primary-50 border-primary-200 dark:bg-primary-900/30 dark:border-primary-800'
              }`}
            >
              <Bell className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-800 dark:text-slate-100">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{formatDate(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
