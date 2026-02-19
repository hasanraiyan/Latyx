import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

/** GET /health */
export const getHealth = () => api.get('/health').then((r) => r.data);

/** GET /design-systems */
export const getDesignSystems = () => api.get('/design-systems').then((r) => r.data);

/**
 * POST /compile
 * @param {{ source_code: string, compiler?: string }} payload
 * @param {boolean} debug
 */
export const compile = (payload, debug = false, token) =>
  api
    .post('/compile', payload, {
      params: debug ? { debug: true } : {},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then((r) => r.data);

/**
 * POST /assist
 * @param {{ source_code: string, prompt: string, compiler?: string, design_system_id?: string, provider?: string }} payload
 */
export const assist = (payload, token) =>
  api
    .post('/assist', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then((r) => r.data);

/**
 * GET /me/jobs
 * @param {string} token
 */
export const getMyJobs = (token) =>
  api.get('/me/jobs', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);

export default api;


/** POST /api/v1/api-keys */
export const createApiKey = (payload, token) =>
  api
    .post('/api/v1/api-keys', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then((r) => r.data);

/** GET /api/v1/api-keys */
export const listApiKeys = (token) =>
  api
    .get('/api/v1/api-keys', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then((r) => r.data);

/** DELETE /api/v1/api-keys/:id */
export const deleteApiKey = (id, token) =>
  api.delete(`/api/v1/api-keys/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
