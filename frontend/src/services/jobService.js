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

export const jobService = {
  getJobs: async (filters = {}) => {
    return api.get('/jobs', { params: cleanParams(filters) });
  },

  getJob: async (id) => {
    return api.get(`/jobs/${id}`);
  },

  createJob: async (data) => {
    return api.post('/jobs', data);
  },

  updateJob: async (id, data) => {
    return api.put(`/jobs/${id}`, data);
  },

  deleteJob: async (id) => {
    return api.delete(`/jobs/${id}`);
  },

  applyToJob: async (jobId, data) => {
    return api.post(`/jobs/${jobId}/apply`, data);
  },

  saveJob: async (jobId) => {
    return api.post(`/jobs/${jobId}/save`);
  },

  unsaveJob: async (jobId) => {
    return api.delete(`/jobs/${jobId}/save`);
  },

  getSavedJobs: async () => {
    return api.get('/jobs/saved/list');
  },

  getApplications: async () => {
    return api.get('/jobs/applications/me');
  },

  getJobApplicants: async (jobId) => {
    return api.get(`/jobs/${jobId}/applicants`);
  },

  updateApplicationStatus: async (id, status) => {
    return api.put(`/applications/${id}/status`, { status });
  },

  withdrawApplication: async (id) => {
    return api.delete(`/applications/${id}`);
  },

  getCategories: async () => {
    return api.get('/jobs/meta/categories');
  },

  getExperienceLevels: async () => {
    return api.get('/jobs/meta/experience-levels');
  },

  // ---------- Recruiter ----------
  getRecruiterJobs: async () => {
    return api.get('/jobs/recruiter/mine');
  },

  getRecruiterApplications: async () => {
    return api.get('/jobs/recruiter/applications');
  },
};
