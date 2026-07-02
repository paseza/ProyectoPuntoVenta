// Controller de inventario
const inventarioService = require('./inventario.service');

// POST /api/inventario/entrada
async function registrarEntrada(req, res) {
  const { idProducto, cantidad, costoUnitario } = req.body;
  const movimiento = await inventarioService.registrarEntrada({
    idProducto,
    idUsuario: req.usuario.idUsuario,
    cantidad,
    costoUnitario,
  });
  res.status(201).json({ success: true, data: movimiento });
}

// POST /api/inventario/ajuste
async function registrarAjuste(req, res) {
  const { idProducto, cantidadFinal, motivo } = req.body;
  const movimiento = await inventarioService.registrarAjuste({
    idProducto,
    idUsuario: req.usuario.idUsuario,
    cantidadFinal,
    motivo,
  });
  res.status(201).json({ success: true, data: movimiento });
}

// GET /api/inventario/movimientos?idProducto=...
async function listarMovimientos(req, res) {
  const { idProducto } = req.query;
  const movimientos = await inventarioService.listarMovimientos({
    idProducto: idProducto ? Number(idProducto) : undefined,
  });
  res.status(200).json({ success: true, data: movimientos });
}

// GET /api/inventario/alertas
async function obtenerAlertas(req, res) {
  const alertas = await inventarioService.obtenerAlertasStock();
  res.status(200).json({ success: true, data: alertas });
}

module.exports = {
  registrarEntrada,
  registrarAjuste,
  listarMovimientos,
  obtenerAlertas,
};
