// Servicio de turnos.
// Un turno representa el período de trabajo entre la apertura y el corte de caja.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');

// Abre un nuevo turno. El índice único parcial en schema.sql
// (idx_turnos_unico_abierto) impide a nivel de base de datos que existan
// dos turnos con estado='abierto' simultáneamente; aquí se traduce ese
// conflicto de Postgres a un error de negocio legible.
async function abrirTurno(idUsuario, fondoInicial) {
  const { data, error } = await supabase
    .from('turnos')
    .insert({
      id_usuario: idUsuario,
      fondo_inicial: fondoInicial,
      estado: 'abierto',
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ErrorApp('Ya existe un turno abierto en esta terminal', 409);
    }
    throw new ErrorApp('No se pudo abrir el turno', 500);
  }

  return data;
}

// Obtiene el turno actualmente abierto, si existe
async function obtenerTurnoActivo() {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('estado', 'abierto')
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar el turno activo', 500);
  }

  if (!data) {
    throw new ErrorApp('No hay turno activo', 404);
  }

  return data;
}

// Variante que no lanza error si no hay turno activo (uso interno de otros servicios)
async function obtenerTurnoActivoOrNull() {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('estado', 'abierto')
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar el turno activo', 500);
  }

  return data;
}

async function obtenerTurnoPorId(idTurno) {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('id_turno', idTurno)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar el turno', 500);
  }

  if (!data) {
    throw new ErrorApp('Turno no encontrado', 404);
  }

  return data;
}

module.exports = {
  abrirTurno,
  obtenerTurnoActivo,
  obtenerTurnoActivoOrNull,
  obtenerTurnoPorId,
};
