// Rutas del módulo de productos y categorías
const express = require('express');
const router = express.Router();

const productosController = require('./productos.controller');
const asyncHandler = require('../../lib/asyncHandler');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRoleMiddleware = require('../../middlewares/requireRole.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const {
  crearCategoriaSchema,
  crearProductoSchema,
  actualizarProductoSchema,
} = require('./productos.schema');

// --- Categorías ---
router.get('/categorias', authMiddleware, asyncHandler(productosController.listarCategorias));

router.post(
  '/categorias',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  validateMiddleware(crearCategoriaSchema),
  asyncHandler(productosController.crearCategoria)
);

// --- Productos ---
router.get('/productos', authMiddleware, asyncHandler(productosController.buscar));

router.get('/productos/:id', authMiddleware, asyncHandler(productosController.obtenerPorId));

router.post(
  '/productos',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  validateMiddleware(crearProductoSchema),
  asyncHandler(productosController.crear)
);

router.put(
  '/productos/:id',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  validateMiddleware(actualizarProductoSchema),
  asyncHandler(productosController.actualizar)
);

router.delete(
  '/productos/:id',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  asyncHandler(productosController.desactivar)
);

router.put(
  '/productos/:id/reactivar',
  authMiddleware,
  requireRoleMiddleware(['admin']),
  asyncHandler(productosController.reactivar)
);

module.exports = router;
