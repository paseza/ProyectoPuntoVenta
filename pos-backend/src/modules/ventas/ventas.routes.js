// Rutas del módulo de ventas
const express = require('express');
const router = express.Router();

const ventasController = require('./ventas.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const {
  agregarDetalleSchema,
  aplicarDescuentoSchema,
  cobrarVentaSchema,
  devolucionSchema,
} = require('./ventas.schema');

// Todas las rutas de ventas requieren sesión activa
router.use(authMiddleware);

router.post('/', asyncHandler(ventasController.crear));

router.get('/:folio', asyncHandler(ventasController.obtenerPorFolio));

router.post(
  '/:id/detalle',
  validateMiddleware(agregarDetalleSchema),
  asyncHandler(ventasController.agregarDetalle)
);

router.delete('/:id/detalle/:idDetalle', asyncHandler(ventasController.eliminarDetalle));

router.post(
  '/:id/descuento',
  validateMiddleware(aplicarDescuentoSchema),
  asyncHandler(ventasController.aplicarDescuento)
);

router.post(
  '/:id/cobrar',
  validateMiddleware(cobrarVentaSchema),
  asyncHandler(ventasController.cobrar)
);

router.post(
  '/:folio/devolucion',
  validateMiddleware(devolucionSchema),
  asyncHandler(ventasController.procesarDevolucion)
);

module.exports = router;
