import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const TagManager = ({ title, description, items, onAdd, onRemove }) => {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onAdd(trimmed);
      setValue('');
    } catch (error) {
      toast.error(error?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full dark:bg-primary-900/40 dark:text-primary-300"
          >
            {item}
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">None added yet</p>}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-field"
          placeholder="Add new..."
        />
        <button type="submit" disabled={saving} className="btn-secondary shrink-0 disabled:opacity-50">
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

const AdminSettings = () => {
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(true);
  const [categories, setCategories] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [salary, setSalary] = useState({ currency: 'INR', currencySymbol: '₹', minSalary: 0, maxSalary: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);

  useEffect(() => {
    Promise.all([
      adminService.getAnnouncement(),
      adminService.getCategories(),
      adminService.getExperienceLevels(),
      adminService.getSalarySettings(),
    ]).then(([announcement, cats, levels, salarySettings]) => {
      setMessage(announcement.message || '');
      setActive(announcement.active !== false);
      setCategories(cats);
      setExperienceLevels(levels);
      setSalary(salarySettings);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateAnnouncement({ message, active });
      toast.success('Website settings updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (name) => {
    const updated = await adminService.addCategory(name);
    setCategories(updated);
    toast.success('Category added');
  };

  const handleRemoveCategory = async (name) => {
    const updated = await adminService.deleteCategory(name);
    setCategories(updated);
    toast.success('Category removed');
  };

  const handleAddLevel = async (name) => {
    const updated = await adminService.addExperienceLevel(name);
    setExperienceLevels(updated);
    toast.success('Experience level added');
  };

  const handleRemoveLevel = async (name) => {
    const updated = await adminService.deleteExperienceLevel(name);
    setExperienceLevels(updated);
    toast.success('Experience level removed');
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setSavingSalary(true);
    try {
      await adminService.updateSalarySettings(salary);
      toast.success('Salary settings updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update salary settings');
    } finally {
      setSavingSalary(false);
    }
  };

  if (loading) return <p className="text-slate-400 dark:text-slate-500">Loading...</p>;

  return (
    <div className="page-admin-settings">
      <h1 className="text-2xl font-bold mb-6">Website Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700 lg:col-span-2">
          <h2 className="font-semibold mb-4">Site-wide Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Announcement Message</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field resize-none"
                placeholder="e.g. New jobs added every week!"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Show Announcement</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display this banner across the site</p>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Announcement'}
            </button>
          </form>
        </div>

        <TagManager
          title="Job Categories"
          description="These appear in job listings and the job filter across the site."
          items={categories}
          onAdd={handleAddCategory}
          onRemove={handleRemoveCategory}
        />

        <TagManager
          title="Experience Levels"
          description="Used when posting jobs and filtering the job board."
          items={experienceLevels}
          onAdd={handleAddLevel}
          onRemove={handleRemoveLevel}
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700 lg:col-span-2">
          <h2 className="font-semibold mb-1">Salary Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Defaults used across salary fields and range filters site-wide.
          </p>
          <form onSubmit={handleSalarySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Currency Symbol</label>
              <input
                type="text"
                value={salary.currencySymbol}
                onChange={(e) => setSalary({ ...salary, currencySymbol: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Default Min Salary</label>
              <input
                type="number"
                value={salary.minSalary}
                onChange={(e) => setSalary({ ...salary, minSalary: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Default Max Salary</label>
              <input
                type="number"
                value={salary.maxSalary}
                onChange={(e) => setSalary({ ...salary, maxSalary: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" disabled={savingSalary} className="btn-primary disabled:opacity-50">
                {savingSalary ? 'Saving...' : 'Save Salary Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
