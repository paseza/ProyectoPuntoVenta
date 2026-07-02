// Rutas del módulo de corte de caja
const express = require('express');
const router = express.Router();

const corteCajaController = require('./corteCaja.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRoleMiddleware = require('../../middlewares/requireRole.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { corteCajaSchema } = require('./corteCaja.schema');

// Solo supervisores y admin pueden generar o consultar cortes
router.use(authMiddleware);
router.use(requireRoleMiddleware(['supervisor', 'admin']));

router.post(
  '/',
  validateMiddleware(corteCajaSchema),
  asyncHandler(corteCajaController.generarCorte)
);

router.get('/', asyncHandler(corteCajaController.listar));

module.exports = router;
