import { api } from './axios';

export const DashboardAPI = {
  getCounts: () => api.get('/dashboard/counts'),

  getPerformance: (type: 'week' | 'month' | 'year') =>
    api.get(`/dashboard/performance?type=${type}`),
};