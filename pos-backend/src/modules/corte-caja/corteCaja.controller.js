// Controller de corte de caja
const corteCajaService = require('./corteCaja.service');

// POST /api/corte-caja
async function generarCorte(req, res) {
  const corte = await corteCajaService.generarCorte(req.body);
  res.status(201).json({ success: true, data: corte });
}

// GET /api/corte-caja
async function listar(req, res) {
  const { fechaInicio, fechaFin } = req.query;
  const cortes = await corteCajaService.listarCortes({ fechaInicio, fechaFin });
  res.status(200).json({ success: true, data: cortes });
}

module.exports = {
  generarCorte,
  listar,
};
