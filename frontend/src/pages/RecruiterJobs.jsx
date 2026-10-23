import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const emptyForm = {
  title: '', location: '', type: 'Full-time', category: '',
  experienceLevel: '', remote: false, salaryMin: '', salaryMax: '', description: '', skills: '',
};

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await jobService.getRecruiterJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    jobService.getCategories().then(setCategories);
    jobService.getExperienceLevels().then(setExperienceLevels);
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0] || '', experienceLevel: experienceLevels[0] || '' });
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title, location: job.location, type: job.type,
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
        await jobService.updateJob(editingId, payload);
        toast.success('Job updated');
      } else {
        await jobService.createJob(payload);
        toast.success('Job submitted for approval');
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.deleteJob(deleteTarget.id);
      toast.success('Job deleted');
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-recruiter-jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto dark:bg-slate-800 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4">Job Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Applicants</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500">Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500">You haven&apos;t posted any jobs yet</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                  <td className="p-4 font-medium">{job.title}</td>
                  <td className="p-4">{job.type}</td>
                  <td className="p-4">{job.applicants || 0}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[job.status] || 'bg-slate-100 dark:bg-slate-700'}`}>
                      {job.status === 'pending' ? 'Pending Approval' : job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(job)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(job)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete">
                        <Trash2 className="w-4 h-4" />
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
              <h3 className="font-semibold">{editingId ? 'Edit Job' : 'Post a Job'}</h3>
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
              <p className="text-xs text-slate-400 dark:text-slate-500">
                New and edited jobs are reviewed by our team before they go live.
              </p>
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Submit Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-6 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Delete this job?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              &quot;{deleteTarget.title}&quot; will be permanently removed. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
