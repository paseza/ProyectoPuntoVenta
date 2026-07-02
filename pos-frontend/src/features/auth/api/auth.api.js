import { apiClient } from '../../../lib/apiClient.js';

export function login({ usuario, pin }) {
  return apiClient.post('/auth/login', { usuario, pin });
}

export function autorizarSupervisor({ usuario, pin }) {
  return apiClient.post('/auth/autorizar-supervisor', { usuario, pin });
}
