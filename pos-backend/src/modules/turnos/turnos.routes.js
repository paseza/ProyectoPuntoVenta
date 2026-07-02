// Rutas del módulo de turnos
const express = require('express');
const router = express.Router();

const turnosController = require('./turnos.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { aperturaTurnoSchema } = require('./turnos.schema');

router.post(
  '/turnos/apertura',
  authMiddleware,
  validateMiddleware(aperturaTurnoSchema),
  asyncHandler(turnosController.abrirTurno)
);

router.get('/turnos/activo', authMiddleware, asyncHandler(turnosController.obtenerActivo));

module.exports = router;
