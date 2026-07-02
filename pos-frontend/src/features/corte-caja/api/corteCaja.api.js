import { apiClient } from '../../../lib/apiClient.js';

export function generarCorte({ efectivoContado, supervisorUsuario, supervisorPin, notas }) {
  return apiClient.post('/corte-caja', { efectivoContado, supervisorUsuario, supervisorPin, notas });
}

export function listarCortes({ fechaInicio, fechaFin } = {}) {
  const params = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;
  return apiClient.get('/corte-caja', { params });
}
