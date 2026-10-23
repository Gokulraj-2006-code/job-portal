import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, CheckCircle, XCircle, X } from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const emptyForm = { name: '', industry: '', location: '', website: '', description: '', logo: '' };

const autoLogoUrl = (name, seed = '4f46e5') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Company')}&background=${seed}&color=fff&bold=true&format=svg`;

const logoColors = ['4f46e5', '0f766e', '15803d', 'b45309', 'be185d', '6d28d9', '0e7490', 'be123c'];
const colorForName = (name) => {
  const sum = (name || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return logoColors[sum % logoColors.length];
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await adminService.getAllCompanies({ search, status: statusFilter });
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (company) => {
    setEditingId(company.id);
    setForm({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      website: company.website || '',
      description: company.description || '',
      logo: company.logo || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      logo: form.logo?.trim() || autoLogoUrl(form.name, colorForName(form.name)),
    };
    try {
      if (editingId) {
        await adminService.updateCompany(editingId, payload);
        toast.success('Company updated');
      } else {
        await adminService.createCompany({ ...payload, status: 'approved' });
        toast.success('Company added');
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (company) => {
    await adminService.approveCompany(company.id);
    toast.success('Company approved');
    load();
  };

  const handleReject = async (company) => {
    await adminService.rejectCompany(company.id);
    toast.success('Company rejected');
    load();
  };

  return (
    <div className="page-admin-companies">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="All">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
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
              <th className="p-4">Company</th>
              <th className="p-4">Industry</th>
              <th className="p-4">Jobs Posted</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500">Loading...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500">No companies found</td></tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                  <td className="p-4 font-medium flex items-center gap-2">
                    {company.logo && <img src={company.logo} alt="" className="w-6 h-6 rounded" />}
                    {company.name}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{company.industry}</td>
                  <td className="p-4">{company.jobCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      company.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : company.status === 'rejected'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {company.status !== 'approved' && (
                        <button onClick={() => handleApprove(company)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {company.status !== 'rejected' && (
                        <button onClick={() => handleReject(company)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEditForm(company)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold">{editingId ? 'Edit Company' : 'Add Company'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="label-text">Company Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Logo URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={form.logo?.trim() || autoLogoUrl(form.name, colorForName(form.name))}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="input-field"
                    placeholder="Leave blank to auto-generate from name"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Industry</label>
                <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Website</label>
                <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Company'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
