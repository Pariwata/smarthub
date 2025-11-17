import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints
export const complianceApi = {
  // Dashboard
  getOverview: () => api.get('/dashboard/overview'),
  getMetrics: () => api.get('/dashboard/metrics'),
  getUpcomingDeadlines: (days?: number) =>
    api.get('/dashboard/deadlines', { params: { days } }),
  getRecentChanges: (limit?: number) =>
    api.get('/dashboard/recent-changes', { params: { limit } }),
  getComplianceByFramework: () => api.get('/dashboard/compliance-by-framework'),

  // Frameworks
  getFrameworks: () => api.get('/frameworks'),
  getFramework: (id: string) => api.get(`/frameworks/${id}`),
  createFramework: (data: any) => api.post('/frameworks', data),
  updateFramework: (id: string, data: any) => api.put(`/frameworks/${id}`, data),
  deleteFramework: (id: string) => api.delete(`/frameworks/${id}`),
  getFrameworkStats: (id: string) => api.get(`/frameworks/${id}/stats`),

  // Regulations
  getRegulations: (params?: any) => api.get('/regulations', { params }),
  getRegulation: (id: string) => api.get(`/regulations/${id}`),
  createRegulation: (data: any) => api.post('/regulations', data),
  updateRegulation: (id: string, data: any) => api.put(`/regulations/${id}`, data),
  deleteRegulation: (id: string) => api.delete(`/regulations/${id}`),
  getRegulationChanges: (id: string) => api.get(`/regulations/${id}/changes`),

  // Obligations
  getObligations: (params?: any) => api.get('/obligations', { params }),
  getObligation: (id: string) => api.get(`/obligations/${id}`),
  createObligation: (data: any) => api.post('/obligations', data),
  updateObligation: (id: string, data: any) => api.put(`/obligations/${id}`, data),
  deleteObligation: (id: string) => api.delete(`/obligations/${id}`),
  getObligationCompliance: (id: string) => api.get(`/obligations/${id}/compliance`),

  // Actions
  getActions: (params?: any) => api.get('/actions', { params }),
  getAction: (id: string) => api.get(`/actions/${id}`),
  createAction: (data: any) => api.post('/actions', data),
  updateAction: (id: string, data: any) => api.put(`/actions/${id}`, data),
  deleteAction: (id: string) => api.delete(`/actions/${id}`),
  updateActionStatus: (id: string, data: any) =>
    api.patch(`/actions/${id}/status`, data),

  // Audits
  getAudits: () => api.get('/audits'),

  // Status
  getStatus: () => api.get('/status'),

  // Evidence
  getEvidence: () => api.get('/evidence'),

  // Risks
  getRisks: () => api.get('/risks'),
};
