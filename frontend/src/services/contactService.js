import api from './api';

export const contactService = {
  submitMessage: async (data) => {
    return api.post('/contact', data);
  },
};
