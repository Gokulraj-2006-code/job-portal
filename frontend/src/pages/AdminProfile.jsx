import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User, Mail, Phone, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToBase64(file);
      const updated = await userService.uploadAvatar(dataUrl);
      setAvatar(updated.avatar);
      updateUser(updated);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const updated = await userService.deleteAvatar();
      setAvatar(null);
      updateUser(updated);
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error(error?.message || 'Failed to remove photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name, phone });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-admin-profile">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-lg dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden dark:bg-primary-900/40">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <label
              htmlFor="admin-avatar-upload"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer transition shadow"
              title={avatar ? 'Change photo' : 'Upload photo'}
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="admin-avatar-upload"
            />
          </div>
          <div>
            <p className="font-semibold text-lg">{name || 'Admin'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            <div className="flex items-center gap-3 mt-1">
              {uploadingAvatar && (
                <span className="text-xs text-slate-400 dark:text-slate-500">Uploading...</span>
              )}
              {avatar && !uploadingAvatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="text-xs text-red-500 hover:text-red-600 transition"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="label-text flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
