// Cliente HTTP centralizado. Traduce el sobre { success, data } / { success, error }
// del backend (skill-ith-backend.md) a promesas planas y maneja errores de forma global.
import { createElement } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'pos_token';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Muestra un toast de error que permanece hasta que el usuario lo cierra manualmente (TF-32).
function mostrarErrorPersistente(mensaje) {
  toast.custom(
    (t) =>
      createElement(
        'div',
        {
          className: `flex items-start gap-3 rounded-md bg-red-600 px-4 py-3 text-white shadow-lg ${
            t.visible ? 'animate-enter' : 'animate-leave'
          }`,
        },
        createElement('span', { className: 'text-sm' }, mensaje),
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => toast.dismiss(t.id),
            className: 'ml-2 text-white/80 hover:text-white',
            'aria-label': 'Cerrar notificación',
          },
          '✕'
        )
      ),
    { duration: Infinity }
  );
}

let redirigiendoPorSesion = false;

// Endpoints públicos de autenticación: un 401 aquí es "credenciales inválidas",
// no "sesión expirada", y lo maneja el propio formulario (no debe cerrar la sesión activa).
const ENDPOINTS_AUTENTICACION_PUBLICA = ['/auth/login', '/auth/autorizar-supervisor'];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const esAuthPublico = ENDPOINTS_AUTENTICACION_PUBLICA.some((endpoint) => url.includes(endpoint));
    // Permite a llamadas puntuales (ej. sondear si hay turno activo, buscar producto
    // al escanear) omitir el toast global porque ya muestran su propio mensaje en contexto.
    const silenciado = Boolean(error.config?.suppressGlobalToast);
    const mensaje =
      error.response?.data?.error ||
      (error.request ? 'No se pudo conectar con el servidor. Verifica tu conexión.' : error.message);

    if (status === 401 && !esAuthPublico) {
      localStorage.removeItem(TOKEN_KEY);
      if (!redirigiendoPorSesion && window.location.pathname !== '/login') {
        redirigiendoPorSesion = true;
        mostrarErrorPersistente('Tu sesión expiró. Inicia sesión de nuevo.');
        window.location.assign('/login');
      }
    } else if (!esAuthPublico && !silenciado) {
      mostrarErrorPersistente(mensaje);
    }

    return Promise.reject(new ApiError(mensaje, status));
  }
);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function unwrap(promise) {
  const response = await promise;
  return response.data?.data;
}

export const apiClient = {
  get: (url, config) => unwrap(axiosInstance.get(url, config)),
  post: (url, body, config) => unwrap(axiosInstance.post(url, body, config)),
  put: (url, body, config) => unwrap(axiosInstance.put(url, body, config)),
  delete: (url, config) => unwrap(axiosInstance.delete(url, config)),
};

export function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}
