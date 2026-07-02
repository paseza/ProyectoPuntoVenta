// Controller de ventas
const ventasService = require('./ventas.service');
const env = require('../../config/env');

// POST /api/ventas
async function crear(req, res) {
  const venta = await ventasService.crearVenta(req.usuario.idUsuario);
  res.status(201).json({ success: true, data: venta });
}

// GET /api/ventas/:folio
async function obtenerPorFolio(req, res) {
  const venta = await ventasService.obtenerVentaPorFolio(req.params.folio);
  res.status(200).json({ success: true, data: venta });
}

// POST /api/ventas/:id/detalle
async function agregarDetalle(req, res) {
  const detalle = await ventasService.agregarDetalle(Number(req.params.id), req.body);
  res.status(201).json({ success: true, data: detalle });
}

// DELETE /api/ventas/:id/detalle/:idDetalle
async function eliminarDetalle(req, res) {
  const venta = await ventasService.eliminarDetalle(
    Number(req.params.id),
    Number(req.params.idDetalle)
  );
  res.status(200).json({ success: true, data: venta });
}

// POST /api/ventas/:id/descuento
async function aplicarDescuento(req, res) {
  const venta = await ventasService.aplicarDescuento(
    Number(req.params.id),
    req.body,
    env.limiteDescuentoPct
  );
  res.status(200).json({ success: true, data: venta });
}

// POST /api/ventas/:id/cobrar
async function cobrar(req, res) {
  const venta = await ventasService.cobrarVenta(
    Number(req.params.id),
    req.body,
    req.usuario.idUsuario
  );
  res.status(200).json({ success: true, data: venta });
}

// POST /api/ventas/:folio/devolucion
async function procesarDevolucion(req, res) {
  const devolucion = await ventasService.procesarDevolucion(
    req.params.folio,
    req.body,
    req.usuario.idUsuario
  );
  res.status(201).json({ success: true, data: devolucion });
}

module.exports = {
  crear,
  obtenerPorFolio,
  agregarDetalle,
  eliminarDetalle,
  aplicarDescuento,
  cobrar,
  procesarDevolucion,
};
