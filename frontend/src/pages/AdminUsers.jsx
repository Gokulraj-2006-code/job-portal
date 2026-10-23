import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ban, CheckCircle, X, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingUser, setViewingUser] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  const load = async () => {
    setLoading(true);
    const data = await adminService.getAllUsers({ search, role: roleFilter, status: statusFilter });
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      toast.success(newStatus === 'blocked' ? 'User blocked' : 'User activated');
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to update user');
    }
  };

  const handleViewApplications = async (user) => {
    setViewingUser(user);
    const apps = await adminService.getUserApplications(user.id);
    setUserApplications(apps);
  };

  return (
    <div className="page-admin-users">
      <h1 className="text-2xl font-bold mb-6">Job Seekers &amp; Recruiters</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:w-40">
          <option value="All">All Roles</option>
          <option value="seeker">Job Seekers</option>
          <option value="recruiter">Recruiters</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        {search && (
          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
            Searching for &quot;{search}&quot;
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto dark:bg-slate-800 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.status === 'blocked'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'seeker' && (
                        <button
                          onClick={() => handleViewApplications(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="View applications"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        title={user.status === 'blocked' ? 'Activate' : 'Block'}
                      >
                        {user.status === 'blocked' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                     
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Applications Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingUser(null)}>
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold">{viewingUser.name}&apos;s Applications</h3>
              <button onClick={() => setViewingUser(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {userApplications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 dark:text-slate-500">No applications from this user</p>
              ) : (
                userApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-3 last:pb-0 dark:border-slate-700">
                    <div>
                      <p className="font-medium">{app.job?.title}</p>
                      <p className="text-slate-500 dark:text-slate-400">{app.job?.company?.name}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 capitalize">{app.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
