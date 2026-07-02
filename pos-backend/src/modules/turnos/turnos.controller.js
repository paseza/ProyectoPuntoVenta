// Controller de turnos
const turnosService = require('./turnos.service');

// POST /api/turnos/apertura
async function abrirTurno(req, res) {
  const { fondoInicial } = req.body;
  const turno = await turnosService.abrirTurno(req.usuario.idUsuario, fondoInicial);
  res.status(201).json({ success: true, data: turno });
}

// GET /api/turnos/activo
async function obtenerActivo(req, res) {
  const turno = await turnosService.obtenerTurnoActivo();
  res.status(200).json({ success: true, data: turno });
}

module.exports = {
  abrirTurno,
  obtenerActivo,
};
