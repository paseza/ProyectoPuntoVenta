import { apiClient } from '../../../lib/apiClient.js';

export function listarCategorias() {
  return apiClient.get('/categorias');
}

export function buscarProductos({ buscar } = {}) {
  const params = {};
  if (buscar) params.buscar = buscar;
  return apiClient.get('/productos', { params });
}

export function crearProducto(datos) {
  return apiClient.post('/productos', datos);
}

export function actualizarProducto(idProducto, cambios) {
  return apiClient.put(`/productos/${idProducto}`, cambios);
}

export function desactivarProducto(idProducto) {
  return apiClient.delete(`/productos/${idProducto}`);
}

export function reactivarProducto(idProducto) {
  return apiClient.put(`/productos/${idProducto}/reactivar`);
}
