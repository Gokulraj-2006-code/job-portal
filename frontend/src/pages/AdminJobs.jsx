import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Pencil, CheckCircle, XCircle, X, Settings } from 'lucide-react';
import { adminService } from '../services/adminService';
import { companyService } from '../services/companyService';
import toast from 'react-hot-toast';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const emptyForm = {
  title: '', companyId: '', location: '', type: 'Full-time', category: '',
  experienceLevel: '', remote: false, salaryMin: '', salaryMax: '', description: '', skills: '',
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await adminService.getAllJobs({ search, status: statusFilter, type: typeFilter });
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    companyService.getCompanies().then(setCompanies);
    adminService.getCategories().then(setCategories);
    adminService.getExperienceLevels().then(setExperienceLevels);
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      companyId: companies[0]?.id || '',
      category: categories[0] || '',
      experienceLevel: experienceLevels[0] || '',
    });
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title, companyId: job.companyId, location: job.location, type: job.type,
      category: job.category, experienceLevel: job.experienceLevel, remote: job.remote,
      salaryMin: job.salaryMin, salaryMax: job.salaryMax, description: job.description,
      skills: (job.skills || []).join(', '),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await adminService.updateJob(editingId, payload);
        toast.success('Job updated');
      } else {
        await adminService.createJob(payload);
        toast.success('Job added');
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (job) => {
    await adminService.approveJob(job.id);
    toast.success('Job approved');
    load();
  };

  const handleReject = async (job) => {
    await adminService.rejectJob(job.id);
    toast.success('Job rejected');
    load();
  };

  return (
    <div className="page-admin-jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/settings"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
          >
            <Settings className="w-4 h-4" /> Manage Categories &amp; Levels
          </Link>
          <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Job
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending Approval</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-40">
          <option value="All">All Types</option>
          {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
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
              <th className="p-4">Job Title</th>
              <th className="p-4">Company</th>
              <th className="p-4">Type</th>
              <th className="p-4">Applicants</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500">Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500">No jobs found</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                  <td className="p-4 font-medium">{job.title}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{job.company?.name || '—'}</td>
                  <td className="p-4">{job.type}</td>
                  <td className="p-4">{job.applicants || 0}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      job.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : job.status === 'rejected'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {job.status === 'pending' ? 'Pending Approval' : job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {job.status !== 'active' && (
                        <button onClick={() => handleApprove(job)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {job.status !== 'rejected' && (
                        <button onClick={() => handleReject(job)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEditForm(job)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                     
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full my-8 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold">{editingId ? 'Edit Job' : 'Add Job'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="label-text">Job Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Company</label>
                <select required value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="input-field">
                  <option value="">Select a company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Location</label>
                <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                    {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Experience Level</label>
                  <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="input-field">
                    {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} className="w-4 h-4" />
                    Remote
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Salary Min</label>
                  <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Salary Max</label>
                  <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-text">Skills (comma-separated)</label>
                <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input-field" placeholder="React, Node.js, SQL" />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Job'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
