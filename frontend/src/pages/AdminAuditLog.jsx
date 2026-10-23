import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';

const AdminAuditLog = () => {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLog().then((data) => {
      setLog(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-admin-audit-log">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        A history of actions taken by admin accounts on this site.
      </p>

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500">Loading...</p>
      ) : log.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No admin activity yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:divide-slate-700">
          {log.map((entry) => (
            <div key={entry.id} className="p-4 flex items-start gap-3">
              <History className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 dark:text-slate-500" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{entry.adminName}</span> — {entry.action}
                  {entry.target && <span className="text-slate-500 dark:text-slate-400"> · {entry.target}</span>}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
