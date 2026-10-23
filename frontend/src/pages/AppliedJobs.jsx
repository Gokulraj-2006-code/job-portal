// src/pages/AppliedJobs.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Building } from 'lucide-react';
import { jobService } from '../services/jobService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  reviewing: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  shortlisted: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  hired: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [withdrawingId, setWithdrawingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await jobService.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusOptions = useMemo(() => {
    const statuses = new Set(applications.map((a) => a.status).filter(Boolean));
    return ['All', ...Array.from(statuses)];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'All') return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  const handleWithdraw = async (id) => {
    setWithdrawingId(id);
    try {
      await jobService.withdrawApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.success('Application withdrawn');
    } catch (error) {
      toast.error(error?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="page-applied-jobs container-custom py-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold">Applied Jobs</h1>
          {!loading && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({filteredApplications.length} of {applications.length})
            </span>
          )}
        </div>

        {!loading && applications.length > 0 && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-700" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4 dark:text-slate-500" />
          <p className="text-slate-500 dark:text-slate-400">You haven&apos;t applied to any jobs yet</p>
          <Link to="/jobs" className="btn-primary inline-block mt-4">
            Browse Jobs
          </Link>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No applications match this status</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto dark:bg-slate-800 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4">Job</th>
                <th className="p-4">Company</th>
                <th className="p-4">Applied On</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, i) => (
                <tr
                  key={app.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                >
                  <td className="p-4 font-medium">
                    <Link to={`/jobs/${app.job?.id}`} className="hover:text-primary-600 transition">
                      {app.job?.title || 'Unknown Job'}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      {app.job?.company?.name || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(app.appliedAt || app.createdAt)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[app.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      disabled={withdrawingId === app.id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-50 dark:hover:bg-red-900/30"
                      aria-label="Withdraw application"
                      title="Withdraw application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
