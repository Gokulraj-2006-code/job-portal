import api from './api';

export const userService = {
  getProfile: async () => {
    return api.get('/users/profile');
  },

  updateProfile: async (data) => {
    return api.put('/users/profile', data);
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/users/resume', formData);
  },

  deleteResume: async () => {
    return api.delete('/users/resume');
  },

  uploadAvatar: async (dataUrl) => {
    return api.post('/users/avatar', { avatar: dataUrl });
  },

  deleteAvatar: async () => {
    return api.delete('/users/avatar');
  },

  changePassword: async (currentPassword, newPassword) => {
    return api.put('/users/change-password', { currentPassword, newPassword });
  },

  deleteAccount: async () => {
    return api.delete('/users/account');
  },

  getNotifications: async () => {
    return api.get('/users/notifications');
  },

  markNotificationRead: async (id) => {
    return api.put(`/users/notifications/${id}/read`);
  },
};
