import { apiClient } from '../../../lib/apiClient.js';

export function obtenerTurnoActivo() {
  // 404 "No hay turno activo" es un estado normal, no un error de red (se maneja en el hook).
  return apiClient.get('/turnos/activo', { suppressGlobalToast: true });
}

export function abrirTurno(fondoInicial) {
  return apiClient.post('/turnos/apertura', { fondoInicial });
}
