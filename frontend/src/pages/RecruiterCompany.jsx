import React, { useEffect, useRef, useState } from 'react';
import { Building2, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const RecruiterCompany = () => {
  const { user, updateUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '', location: '', website: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Company Logo — the single image for the Company Profile. Any valid
  // image is accepted; there is no separate owner/user profile photo.
  const [logo, setLogo] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (!user?.companyId) {
      setLoading(false);
      return;
    }
    companyService.getCompany(user.companyId).then((data) => {
      if (!isMounted) return;
      setCompany(data);
      setLogo(data.logo || null);
      setForm({
        name: data.name || '',
        industry: data.industry || '',
        location: data.location || '',
        website: data.website || '',
        description: data.description || '',
      });
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [user?.companyId]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!company) return;
    // Accept any valid image — no restriction to a "logo" style image.
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const dataUrl = await fileToBase64(file);
      const updated = await companyService.uploadLogo(company.id, dataUrl);
      setLogo(updated.logo);
      setCompany(updated);
      // Keep the header's user avatar in sync with the same uploaded
      // image, using the existing avatar storage/update mechanism.
      const updatedUser = await userService.uploadAvatar(dataUrl);
      updateUser(updatedUser);
      toast.success('Company logo updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!company) return;
    try {
      const updated = await companyService.removeLogo(company.id);
      setLogo(null);
      setCompany(updated);
      // Clear it from the header avatar too, since they shared the same image.
      const updatedUser = await userService.deleteAvatar();
      updateUser(updatedUser);
      toast.success('Company logo removed');
    } catch (error) {
      toast.error(error?.message || 'Failed to remove logo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      await companyService.updateCompany(company.id, form);
      toast.success('Company profile updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-recruiter-company"><p className="text-slate-400">Loading...</p></div>;
  }

  return (
    <div className="page-recruiter-company">
      <h1 className="text-2xl font-bold mb-6">Company Profile</h1>

      {/* Company Logo — the single image shown at the top of the Company Profile.
          There is no separate owner/user profile photo section. */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 dark:bg-slate-800 dark:border-slate-700 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden dark:bg-primary-900/40">
            {logo ? (
              <img src={logo} alt="Company logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <label
            htmlFor="company-logo-upload"
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer transition shadow"
            title={logo ? 'Change company logo' : 'Upload company logo'}
          >
            <Camera className="w-3.5 h-3.5" />
          </label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploadingLogo}
            className="hidden"
            id="company-logo-upload"
          />
        </div>
        <div>
          <p className="font-semibold text-lg">{form.name || 'Your Company'}</p>
          {company?.status && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              company.status === 'approved'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}>
              {company.status === 'pending' ? 'Pending Approval' : company.status}
            </span>
          )}
          <div className="flex items-center gap-3 mt-1">
            {uploadingLogo && (
              <span className="text-xs text-slate-400 dark:text-slate-500">Uploading...</span>
            )}
            {logo && !uploadingLogo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-red-500 hover:text-red-600 transition"
              >
                Remove logo
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label className="label-text">Company Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Industry</label>
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-text">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label-text">Website</label>
          <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://" />
        </div>
        <div>
          <label className="label-text">About the Company</label>
          <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default RecruiterCompany;
