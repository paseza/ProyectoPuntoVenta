// Middleware de autorización por rol.
// Requiere que authMiddleware se haya ejecutado antes (req.usuario debe existir).
// Si el rol del usuario no está en la lista permitida, responde 403 (no 401,
// porque el usuario sí está autenticado, simplemente no autorizado para esto).
function requireRoleMiddleware(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
}

module.exports = requireRoleMiddleware;
