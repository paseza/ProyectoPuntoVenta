import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.js';
import AccesoNoPermitido from '../pages/AccesoNoPermitido.jsx';

export default function RutaProtegida({ roles, children }) {
  const { isAutenticado, usuario } = useSession();

  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <AccesoNoPermitido />;
  }

  return children;
}
