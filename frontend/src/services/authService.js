import api from './api';

export const authService = {
  login: async (identifier, password) => {
    return api.post('/auth/login', { identifier, password });
  },

  register: async (data) => {
    return api.post('/auth/register', data);
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async () => {
    return api.post('/auth/reset-password');
  },
};
