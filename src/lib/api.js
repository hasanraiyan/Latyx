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
export const compile = (payload, debug = false) =>
  api.post('/compile', payload, { params: debug ? { debug: true } : {} }).then((r) => r.data);

/**
 * POST /assist
 * @param {{ source_code: string, prompt: string, compiler?: string, design_system_id?: string, provider?: string }} payload
 */
export const assist = (payload) => api.post('/assist', payload).then((r) => r.data);

export default api;
