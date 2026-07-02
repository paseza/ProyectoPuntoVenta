// Rutas del módulo de usuarios y autenticación
const express = require('express');
const router = express.Router();

const usuariosController = require('./usuarios.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRoleMiddleware = require('../../middlewares/requireRole.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const {
  crearUsuarioSchema,
  loginSchema,
  autorizarSupervisorSchema,
} = require('./usuarios.schema');

// --- Autenticación (sin requerir sesión previa) ---
router.post('/auth/login', validateMiddleware(loginSchema), asyncHandler(usuariosController.login));

router.post(
  '/auth/autorizar-supervisor',
  validateMiddleware(autorizarSupervisorSchema),
  asyncHandler(usuariosController.autorizarSupervisor)
);

// --- Gestión de usuarios (requiere sesión + rol admin) ---
router.post(
  '/usuarios',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  validateMiddleware(crearUsuarioSchema),
  asyncHandler(usuariosController.crear)
);

router.get('/usuarios', authMiddleware, requireRoleMiddleware(['admin', 'supervisor']), asyncHandler(usuariosController.listar));

module.exports = router;
