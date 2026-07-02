// Rutas del módulo de reportes
const express = require('express');
const router = express.Router();

const reportesController = require('./reportes.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRoleMiddleware = require('../../middlewares/requireRole.middleware');

router.use(authMiddleware);
router.use(requireRoleMiddleware(['admin', 'supervisor']));

router.get('/ventas', asyncHandler(reportesController.reporteVentas));
router.get('/inventario', asyncHandler(reportesController.reporteInventario));

module.exports = router;
