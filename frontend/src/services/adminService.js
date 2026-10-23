import api from './api';

const cleanParams = (filters = {}) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });
  return params;
};

export const adminService = {
  // ---------- Dashboard stats ----------
  getStats: async () => {
    return api.get('/admin/stats');
  },

  getRecentApplications: async (limit = 5) => {
    return api.get('/admin/applications/recent', { params: { limit } });
  },

  getRecentUsers: async (limit = 5) => {
    return api.get('/admin/users/recent', { params: { limit } });
  },

  getCompanyWiseStats: async () => {
    return api.get('/admin/companies/stats');
  },

  // ---------- Users (job seekers & recruiters) ----------
  getAllUsers: async (filters = {}) => {
    return api.get('/admin/users', { params: cleanParams(filters) });
  },

  getUserApplications: async (userId) => {
    return api.get(`/admin/users/${userId}/applications`);
  },

  updateUserStatus: async (userId, status) => {
    return api.put(`/admin/users/${userId}/status`, { status });
  },

  deleteUser: async (userId) => {
    return api.delete(`/admin/users/${userId}`);
  },

  // ---------- Companies ----------
  getAllCompanies: async (filters = {}) => {
    return api.get('/admin/companies', { params: cleanParams(filters) });
  },

  createCompany: async (data) => {
    return api.post('/admin/companies', data);
  },

  updateCompany: async (id, data) => {
    return api.put(`/admin/companies/${id}`, data);
  },

  deleteCompany: async (id) => {
    return api.delete(`/admin/companies/${id}`);
  },

  approveCompany: async (id) => {
    return api.put(`/admin/companies/${id}/approve`);
  },

  rejectCompany: async (id) => {
    return api.put(`/admin/companies/${id}/reject`);
  },

  // ---------- Jobs ----------
  getAllJobs: async (filters = {}) => {
    return api.get('/admin/jobs', { params: cleanParams(filters) });
  },

  createJob: async (data) => {
    return api.post('/admin/jobs', data);
  },

  updateJob: async (id, data) => {
    return api.put(`/admin/jobs/${id}`, data);
  },

  deleteJob: async (id) => {
    return api.delete(`/admin/jobs/${id}`);
  },

  approveJob: async (id) => {
    return api.put(`/admin/jobs/${id}/approve`);
  },

  rejectJob: async (id) => {
    return api.put(`/admin/jobs/${id}/reject`);
  },

  // ---------- Applications ----------
  getAllApplications: async (filters = {}) => {
    return api.get('/admin/applications', { params: cleanParams(filters) });
  },

  updateApplicationStatus: async (id, status) => {
    return api.put(`/admin/applications/${id}/status`, { status });
  },

  addApplicationNote: async (id, note) => {
    return api.post(`/admin/applications/${id}/notes`, { note });
  },

  // ---------- Contact Messages ----------
  getMessages: async () => {
    return api.get('/messages');
  },

  markMessageRead: async (id) => {
    return api.put(`/messages/${id}/read`);
  },

  deleteMessage: async (id) => {
    return api.delete(`/messages/${id}`);
  },

  // ---------- Audit Log ----------
  getAuditLog: async () => {
    return api.get('/admin/audit-log');
  },

  // ---------- Announcement / Website Settings ----------
  getAnnouncement: async () => {
    return api.get('/admin/announcement');
  },

  updateAnnouncement: async (data) => {
    return api.put('/admin/announcement', data);
  },

  // ---------- Job Categories ----------
  getCategories: async () => {
    return api.get('/admin/categories');
  },

  addCategory: async (name) => {
    return api.post('/admin/categories', { name });
  },

  deleteCategory: async (name) => {
    return api.delete(`/admin/categories/${encodeURIComponent(name)}`);
  },

  // ---------- Experience Levels ----------
  getExperienceLevels: async () => {
    return api.get('/admin/experience-levels');
  },

  addExperienceLevel: async (name) => {
    return api.post('/admin/experience-levels', { name });
  },

  deleteExperienceLevel: async (name) => {
    return api.delete(`/admin/experience-levels/${encodeURIComponent(name)}`);
  },

  // ---------- Salary Settings ----------
  getSalarySettings: async () => {
    return api.get('/admin/salary-settings');
  },

  updateSalarySettings: async (data) => {
    return api.put('/admin/salary-settings', data);
  },
};
