// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Mail, Phone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

const Settings = () => {
  const { user, logout } = useAuth();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [jobAlertFrequency, setJobAlertFrequency] = useState('daily');
  const [profileVisible, setProfileVisible] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <div className="page-dashboard-settings">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-200">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-200">{user?.phone || 'No phone number added'}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              To update these, visit your Profile page.
            </p>
          </div>
          
          {/* Privacy */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold mb-4">Privacy</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Let recruiters find your profile in search</p>
              </div>
              <input
                type="checkbox"
                checked={profileVisible}
                onChange={(e) => setProfileVisible(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-500"
              />
            </div>
          </div>
      

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-1">
              <div>
                <label className="label-text">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field p-1"
                  required
                />
              </div>
              <div>
                <label className="label-text">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field p-1"
                  required
                />
              </div>
              <div>
                <label className="label-text">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field p-1"
                  required
                />
              </div>
              <button type="submit" disabled={changingPassword} className="btn-secondary disabled:opacity-50">
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold">Notification Preferences</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates about your applications</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Get text alerts for application status changes</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-500"
              />
            </div>

            {user?.role !== 'recruiter' && (
            <div>
              <label className="label-text">Job Alert Frequency</label>
              <select
                value={jobAlertFrequency}
                onChange={(e) => setJobAlertFrequency(e.target.value)}
                className="input-field"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
                <option value="off">Off</option>
              </select>
            </div>
            )}
          </div>

          

          <div className="md:col-span-2 text-center">
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>

          {/* Danger Zone */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-red-200 p-6 dark:bg-slate-800 dark:border-red-900/50">
            <h2 className="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            )}
          </div>

        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default Settings;