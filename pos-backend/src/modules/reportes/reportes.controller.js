// Controller de reportes
const reportesService = require('./reportes.service');

// GET /api/reportes/ventas?fechaInicio=...&fechaFin=...
async function reporteVentas(req, res) {
  const { fechaInicio, fechaFin } = req.query;
  const reporte = await reportesService.reporteVentas({ fechaInicio, fechaFin });
  res.status(200).json({ success: true, data: reporte });
}

// GET /api/reportes/inventario
async function reporteInventario(req, res) {
  const reporte = await reportesService.reporteInventario();
  res.status(200).json({ success: true, data: reporte });
}

module.exports = {
  reporteVentas,
  reporteInventario,
};
