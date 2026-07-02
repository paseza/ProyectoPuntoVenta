// Rutas del módulo de inventario
const express = require('express');
const router = express.Router();

const inventarioController = require('./inventario.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRoleMiddleware = require('../../middlewares/requireRole.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { entradaInventarioSchema, ajusteInventarioSchema } = require('./inventario.schema');

router.post(
  '/inventario/entrada',
  authMiddleware,
  requireRoleMiddleware(['admin', 'supervisor']),
  validateMiddleware(entradaInventarioSchema),
  asyncHandler(inventarioController.registrarEntrada)
);

router.post(
  '/inventario/ajuste',
  authMiddleware,
  requireRoleMiddleware(['admin', 'supervisor']),
  validateMiddleware(ajusteInventarioSchema),
  asyncHandler(inventarioController.registrarAjuste)
);

router.get('/inventario/movimientos', authMiddleware, asyncHandler(inventarioController.listarMovimientos));

router.get('/inventario/alertas', authMiddleware, asyncHandler(inventarioController.obtenerAlertas));

module.exports = router;
