// Middleware de autenticación.
// Valida el token JWT, rechaza tokens corruptos/expirados, e inyecta req.usuario.
// También aplica expiración por inactividad (restricción técnica 5.3 del spec):
// si han pasado más de `minutosInactividadMax` desde la última actividad
// registrada en el propio token, la sesión se considera expirada.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No se proporcionó un token de autenticación',
    });
  }

  const token = encabezado.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    // Token corrupto o expirado por jwt.exp -> 401, nunca 500
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
    });
  }

  // Expiración por inactividad: el payload guarda la última actividad conocida.
  const ahoraMs = Date.now();
  const ultimaActividadMs = payload.ultimaActividad || payload.iat * 1000;
  const minutosTranscurridos = (ahoraMs - ultimaActividadMs) / (1000 * 60);

  if (minutosTranscurridos > env.minutosInactividadMax) {
    return res.status(401).json({
      success: false,
      error: 'Sesión expirada por inactividad',
    });
  }

  req.usuario = {
    idUsuario: payload.idUsuario,
    rol: payload.rol,
    usuario: payload.usuario,
  };

  next();
}

module.exports = authMiddleware;
