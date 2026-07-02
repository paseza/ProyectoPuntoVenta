// Servicio de corte de caja.
// Concilia el efectivo físico contra las ventas registradas en el turno
// y cierra el turno mediante el trigger trg_corte_cierra_turno del schema.sql.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');
const turnosService = require('../turnos/turnos.service');
const usuariosService = require('../usuarios/usuarios.service');

// Genera el corte de caja para el turno activo (T-29, HU-13)
async function generarCorte({ efectivoContado, supervisorUsuario, supervisorPin, notas }) {
  // Verificar autorización de supervisor antes de calcular cualquier cosa
  const supervisor = await usuariosService.verificarAutorizacionSupervisor(
    supervisorUsuario,
    supervisorPin
  );

  const turno = await turnosService.obtenerTurnoActivo();

  // Calcular totales del turno a partir de las ventas cerradas
  const { data: ventas, error: errorVentas } = await supabase
    .from('ventas')
    .select('pago_efectivo, pago_tarjeta, total, id_venta_origen, estado')
    .eq('id_turno', turno.id_turno)
    .eq('estado', 'cerrada');

  if (errorVentas) {
    throw new ErrorApp('No se pudo calcular el resumen del turno', 500);
  }

  // Separar ventas normales de notas de devolución (tienen id_venta_origen)
  const ventasNormales = ventas.filter((v) => !v.id_venta_origen);
  const devoluciones = ventas.filter((v) => v.id_venta_origen);

  const ventasEfectivo = ventasNormales.reduce((acc, v) => acc + v.pago_efectivo, 0);
  const ventasTarjeta = ventasNormales.reduce((acc, v) => acc + v.pago_tarjeta, 0);
  // Las devoluciones se registran como pago_efectivo en la nota de devolución
  const totalDevoluciones = devoluciones.reduce((acc, v) => acc + v.pago_efectivo, 0);

  // efectivo_esperado = fondo inicial + ventas en efectivo - devoluciones en efectivo
  const efectivoEsperado = turno.fondo_inicial + ventasEfectivo - totalDevoluciones;
  const diferencia = efectivoContado - efectivoEsperado;

  const { data: corte, error: errorCorte } = await supabase
    .from('corte_caja')
    .insert({
      id_turno: turno.id_turno,
      id_supervisor: supervisor.id_usuario,
      fondo_inicial: turno.fondo_inicial,
      ventas_efectivo: ventasEfectivo,
      ventas_tarjeta: ventasTarjeta,
      total_devoluciones: totalDevoluciones,
      efectivo_esperado: efectivoEsperado,
      efectivo_contado: efectivoContado,
      diferencia,
      notas: notas ?? null,
    })
    .select('*')
    .single();

  if (errorCorte) {
    if (errorCorte.code === '23505') {
      throw new ErrorApp('Este turno ya tiene un corte registrado', 409);
    }
    throw new ErrorApp('No se pudo generar el corte de caja', 500);
  }

  // El trigger trg_corte_cierra_turno en schema.sql cierra el turno automáticamente
  return corte;
}

// Lista cortes de caja con filtro opcional por rango de fechas (T-30)
async function listarCortes({ fechaInicio, fechaFin } = {}) {
  let query = supabase
    .from('corte_caja')
    .select('*, turnos(apertura_at, cierre_at), usuarios(nombre, usuario)')
    .order('created_at', { ascending: false })
    .limit(30);

  if (fechaInicio) {
    query = query.gte('created_at', fechaInicio);
  }

  if (fechaFin) {
    // Incluir todo el día de fechaFin sumando un día
    const fin = new Date(fechaFin);
    fin.setDate(fin.getDate() + 1);
    query = query.lt('created_at', fin.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new ErrorApp('No se pudo obtener el historial de cortes', 500);
  }

  return data;
}

module.exports = {
  generarCorte,
  listarCortes,
};
