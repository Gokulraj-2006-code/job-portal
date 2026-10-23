import api from './api';

export const companyService = {
  getCompanies: async () => {
    return api.get('/companies');
  },

  getCompany: async (id) => {
    return api.get(`/companies/${id}`);
  },

  createCompany: async (data) => {
    return api.post('/companies', data);
  },

  updateCompany: async (id, data) => {
    return api.put(`/companies/${id}`, data);
  },

  deleteCompany: async (id) => {
    return api.delete(`/companies/${id}`);
  },

  uploadLogo: async (id, dataUrl) => {
    return api.post(`/companies/${id}/logo`, { logo: dataUrl });
  },

  removeLogo: async (id) => {
    return api.delete(`/companies/${id}/logo`);
  },

  getCompanyJobs: async (id) => {
    return api.get(`/companies/${id}/jobs`);
  },
};
