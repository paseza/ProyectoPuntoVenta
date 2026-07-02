import { createContext, useCallback, useMemo, useState } from 'react';
import { borrarToken, guardarToken, obtenerToken } from '../lib/apiClient.js';

export const SessionContext = createContext(null);

// Decodifica el payload de un JWT sin verificar la firma (solo lectura en cliente).
function decodificarToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json;
  } catch {
    return null;
  }
}

function usuarioDesdeToken(token) {
  const payload = decodificarToken(token);
  if (!payload) return null;
  return {
    idUsuario: payload.idUsuario,
    usuario: payload.usuario,
    rol: payload.rol,
  };
}

export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => obtenerToken());
  const [usuario, setUsuario] = useState(() => {
    const tokenInicial = obtenerToken();
    return tokenInicial ? usuarioDesdeToken(tokenInicial) : null;
  });
  // Nombre completo del usuario (el token solo trae "usuario", no "nombre");
  // se completa al iniciar sesión desde la respuesta de /auth/login.
  const [nombre, setNombre] = useState(null);

  const iniciarSesion = useCallback((nuevoToken, datosUsuario) => {
    guardarToken(nuevoToken);
    setToken(nuevoToken);
    setUsuario({
      idUsuario: datosUsuario.idUsuario,
      usuario: datosUsuario.usuario,
      rol: datosUsuario.rol,
    });
    setNombre(datosUsuario.nombre);
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setToken(null);
    setUsuario(null);
    setNombre(null);
  }, []);

  const value = useMemo(
    () => ({
      usuario: usuario ? { ...usuario, nombre } : null,
      token,
      isAutenticado: Boolean(token && usuario),
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, nombre, token, iniciarSesion, cerrarSesion]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
