// Registro centralizado de todas las rutas del sistema
const express = require('express');
const router = express.Router();

const usuariosRoutes = require('../modules/usuarios/usuarios.routes');
const productosRoutes = require('../modules/productos/productos.routes');
const turnosRoutes = require('../modules/turnos/turnos.routes');
const ventasRoutes = require('../modules/ventas/ventas.routes');
const inventarioRoutes = require('../modules/inventario/inventario.routes');
const corteCajaRoutes = require('../modules/corte-caja/corteCaja.routes');
const reportesRoutes = require('../modules/reportes/reportes.routes');

// Rutas de autenticación y usuarios (incluye /auth y /usuarios)
router.use('/', usuariosRoutes);

// Módulos del sistema
router.use('/', productosRoutes);     // /categorias  y  /productos
router.use('/', turnosRoutes);        // /turnos
router.use('/ventas', ventasRoutes);  // /ventas
router.use('/', inventarioRoutes);    // /inventario
router.use('/corte-caja', corteCajaRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;
