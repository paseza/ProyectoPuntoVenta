import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../../hooks/useSession.js';
import { login as loginRequest } from '../api/auth.api.js';
import { ApiError } from '../../../lib/apiClient.js';

const RUTA_POR_ROL = {
  cajero: '/ventas',
  supervisor: '/ventas',
  admin: '/productos',
};

export function useAuth() {
  const { iniciarSesion, cerrarSesion: limpiarSesion } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function iniciarSesionConCredenciales(usuario, pin) {
    setError(null);
    setCargando(true);
    try {
      const { token, usuario: datosUsuario } = await loginRequest({ usuario, pin });
      iniciarSesion(token, datosUsuario);
      navigate(RUTA_POR_ROL[datosUsuario.rol] || '/ventas', { replace: true });
      return true;
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'Usuario o PIN incorrectos';
      setError(mensaje || 'Usuario o PIN incorrectos');
      return false;
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    limpiarSesion();
    navigate('/login', { replace: true });
  }

  return { iniciarSesionConCredenciales, cerrarSesion, error, cargando };
}
