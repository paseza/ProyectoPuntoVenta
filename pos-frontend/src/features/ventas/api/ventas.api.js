import { apiClient } from '../../../lib/apiClient.js';

export function buscarProductoPorCodigo(codigo) {
  return apiClient.get('/productos', { params: { codigo }, suppressGlobalToast: true });
}

export function buscarProductosPorNombre(buscar) {
  return apiClient.get('/productos', { params: { buscar } });
}

export function crearVenta() {
  return apiClient.post('/ventas', {});
}

export function agregarDetalle(idVenta, { idProducto, cantidad }) {
  return apiClient.post(`/ventas/${idVenta}/detalle`, { idProducto, cantidad });
}

export function cobrarVenta(idVenta, { pagoEfectivo, pagoTarjeta }) {
  return apiClient.post(`/ventas/${idVenta}/cobrar`, { pagoEfectivo, pagoTarjeta });
}
