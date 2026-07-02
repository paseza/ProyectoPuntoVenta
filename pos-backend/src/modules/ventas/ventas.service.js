// Servicio de ventas.
// Orquesta la lógica de negocio para crear, cobrar, descontar y devolver ventas.
// Delega al servicio de inventario los movimientos de stock para mantener responsabilidades separadas.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');
const { generarSiguienteFolio } = require('../../lib/folioGenerator');
const turnosService = require('../turnos/turnos.service');
const productosService = require('../productos/productos.service');
const inventarioService = require('../inventario/inventario.service');
const usuariosService = require('../usuarios/usuarios.service');

// Crea una venta vacía vinculada al turno activo (T-20)
async function crearVenta(idCajero) {
  const turno = await turnosService.obtenerTurnoActivoOrNull();

  if (!turno) {
    throw new ErrorApp('No hay turno activo. Abre un nuevo turno para continuar.', 409);
  }

  const folio = await generarSiguienteFolio();

  const { data, error } = await supabase
    .from('ventas')
    .insert({
      folio,
      id_turno: turno.id_turno,
      id_cajero: idCajero,
      subtotal: 0,
      descuento_monto: 0,
      descuento_pct: 0,
      total: 0,
      pago_efectivo: 0,
      pago_tarjeta: 0,
      cambio: 0,
      estado: 'abierta',
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      // Colisión de folio bajo concurrencia; reintento automático
      return crearVenta(idCajero);
    }
    throw new ErrorApp('No se pudo crear la venta', 500);
  }

  return data;
}

// Agrega un ítem al detalle de la venta y recalcula subtotal/total (T-21)
async function agregarDetalle(idVenta, { idProducto, cantidad }) {
  const venta = await obtenerVentaPorId(idVenta);
  if (venta.estado !== 'abierta') {
    throw new ErrorApp('No se puede modificar una venta que ya fue cerrada o anulada', 400);
  }

  const producto = await productosService.obtenerProductoPorId(idProducto);
  if (!producto.activo) {
    throw new ErrorApp('El producto no está disponible', 400);
  }

  const precioUnitario = producto.precio_venta;
  const subtotalItem = cantidad * precioUnitario;

  const { data: detalle, error: errorDetalle } = await supabase
    .from('detalle_venta')
    .insert({
      id_venta: idVenta,
      id_producto: idProducto,
      precio_unitario: precioUnitario,
      cantidad,
      subtotal: subtotalItem,
    })
    .select('*')
    .single();

  if (errorDetalle) {
    throw new ErrorApp('No se pudo agregar el producto a la venta', 500);
  }

  await recalcularTotales(idVenta);
  return detalle;
}

// Elimina un ítem del detalle y recalcula totales (T-21)
async function eliminarDetalle(idVenta, idDetalle) {
  const venta = await obtenerVentaPorId(idVenta);
  if (venta.estado !== 'abierta') {
    throw new ErrorApp('No se puede modificar una venta cerrada o anulada', 400);
  }

  const { error } = await supabase
    .from('detalle_venta')
    .delete()
    .eq('id_detalle', idDetalle)
    .eq('id_venta', idVenta);

  if (error) {
    throw new ErrorApp('No se pudo eliminar el ítem de la venta', 500);
  }

  await recalcularTotales(idVenta);
  return obtenerVentaPorId(idVenta);
}

// Recalcula subtotal y total de la venta a partir de su detalle actual
async function recalcularTotales(idVenta) {
  const { data: items, error } = await supabase
    .from('detalle_venta')
    .select('subtotal')
    .eq('id_venta', idVenta);

  if (error) {
    throw new ErrorApp('No se pudo recalcular el total de la venta', 500);
  }

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  // Recuperar descuento actual para recalcular total correctamente
  const { data: venta } = await supabase
    .from('ventas')
    .select('descuento_monto')
    .eq('id_venta', idVenta)
    .single();

  const total = Math.max(0, subtotal - (venta?.descuento_monto || 0));

  await supabase
    .from('ventas')
    .update({ subtotal, total })
    .eq('id_venta', idVenta);
}

// Aplica descuento con autorización de supervisor (T-22, HU-06)
async function aplicarDescuento(idVenta, { tipo, valor, supervisorUsuario, supervisorPin }, limiteDescuentoPct) {
  const venta = await obtenerVentaPorId(idVenta);
  if (venta.estado !== 'abierta') {
    throw new ErrorApp('No se puede aplicar descuento a una venta cerrada', 400);
  }

  // Verificar PIN de supervisor antes de aplicar
  await usuariosService.verificarAutorizacionSupervisor(supervisorUsuario, supervisorPin);

  let descuentoMonto = 0;
  let descuentoPct = 0;

  if (tipo === 'porcentaje') {
    if (valor > limiteDescuentoPct) {
      throw new ErrorApp(`Descuento fuera del límite permitido (máximo ${limiteDescuentoPct}%)`, 400);
    }
    descuentoPct = valor;
    descuentoMonto = (venta.subtotal * valor) / 100;
  } else {
    // Descuento de monto fijo; calcular el porcentaje equivalente para validación
    descuentoPct = venta.subtotal > 0 ? (valor / venta.subtotal) * 100 : 0;
    if (descuentoPct > limiteDescuentoPct) {
      throw new ErrorApp(`Descuento fuera del límite permitido (máximo ${limiteDescuentoPct}%)`, 400);
    }
    descuentoMonto = valor;
  }

  const total = Math.max(0, venta.subtotal - descuentoMonto);

  // Recuperar id_usuario del supervisor para registrarlo en la venta
  const supervisor = await usuariosService.obtenerUsuarioPorUsuario(supervisorUsuario);

  const { data, error } = await supabase
    .from('ventas')
    .update({
      descuento_monto: descuentoMonto,
      descuento_pct: descuentoPct,
      total,
      id_supervisor_desc: supervisor.id_usuario,
    })
    .eq('id_venta', idVenta)
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo aplicar el descuento', 500);
  }

  return data;
}

// Cobra la venta y actualiza el inventario (T-23, HU-07)
async function cobrarVenta(idVenta, { pagoEfectivo, pagoTarjeta }, idCajero) {
  const venta = await obtenerVentaConDetalle(idVenta);
  if (venta.estado !== 'abierta') {
    throw new ErrorApp('Esta venta ya fue procesada', 400);
  }

  if (venta.detalle_venta.length === 0) {
    throw new ErrorApp('No se puede cobrar una venta sin productos', 400);
  }

  const totalPago = pagoEfectivo + pagoTarjeta;
  if (totalPago < venta.total) {
    throw new ErrorApp(
      `El pago ($${totalPago.toFixed(2)}) no cubre el total de la venta ($${venta.total.toFixed(2)})`,
      400
    );
  }

  const cambio = pagoEfectivo > 0 ? Math.max(0, pagoEfectivo - (venta.total - pagoTarjeta)) : 0;

  const { data, error } = await supabase
    .from('ventas')
    .update({
      pago_efectivo: pagoEfectivo,
      pago_tarjeta: pagoTarjeta,
      cambio,
      estado: 'cerrada',
    })
    .eq('id_venta', idVenta)
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo cerrar la venta', 500);
  }

  // Registrar salidas de inventario por cada ítem vendido
  for (const item of venta.detalle_venta) {
    await inventarioService.registrarSalidaPorVenta({
      idProducto: item.id_producto,
      idUsuario: idCajero,
      cantidad: item.cantidad,
      idVenta,
    });
  }

  return data;
}

// Procesa devolución total o parcial con autorización de supervisor (T-25, HU-08)
async function procesarDevolucion(folio, { idsDetalle, supervisorUsuario, supervisorPin }, idUsuario) {
  // Verificar PIN de supervisor
  await usuariosService.verificarAutorizacionSupervisor(supervisorUsuario, supervisorPin);

  const ventaOrigen = await obtenerVentaPorFolio(folio);
  if (ventaOrigen.estado !== 'cerrada') {
    throw new ErrorApp('Solo se pueden devolver ventas cerradas', 400);
  }

  // Obtener los ítems a devolver
  const { data: itemsADevolver, error: errorItems } = await supabase
    .from('detalle_venta')
    .select('*')
    .eq('id_venta', ventaOrigen.id_venta)
    .in('id_detalle', idsDetalle);

  if (errorItems || !itemsADevolver.length) {
    throw new ErrorApp('No se encontraron los ítems de devolución indicados', 404);
  }

  const totalDevolucion = itemsADevolver.reduce((acc, item) => acc + item.subtotal, 0);
  const turno = await turnosService.obtenerTurnoActivoOrNull();

  if (!turno) {
    throw new ErrorApp('No hay turno activo para registrar la devolución', 409);
  }

  // Crear la nota de devolución como una nueva venta vinculada al folio original
  const folioDevolucion = await generarSiguienteFolio();
  const supervisor = await usuariosService.obtenerUsuarioPorUsuario(supervisorUsuario);

  const { data: ventaDevolucion, error: errorVenta } = await supabase
    .from('ventas')
    .insert({
      folio: folioDevolucion,
      id_turno: turno.id_turno,
      id_cajero: idUsuario,
      id_supervisor_desc: supervisor.id_usuario,
      subtotal: totalDevolucion,
      descuento_monto: 0,
      descuento_pct: 0,
      total: totalDevolucion,
      pago_efectivo: totalDevolucion,
      pago_tarjeta: 0,
      cambio: 0,
      estado: 'cerrada',
      id_venta_origen: ventaOrigen.id_venta,
    })
    .select('*')
    .single();

  if (errorVenta) {
    throw new ErrorApp('No se pudo registrar la devolución', 500);
  }

  // Copiar los ítems devueltos al detalle de la nota de devolución
  const itemsDevolucion = itemsADevolver.map((item) => ({
    id_venta: ventaDevolucion.id_venta,
    id_producto: item.id_producto,
    precio_unitario: item.precio_unitario,
    cantidad: item.cantidad,
    subtotal: item.subtotal,
  }));

  await supabase.from('detalle_venta').insert(itemsDevolucion);

  // Reponer inventario por cada ítem devuelto
  for (const item of itemsADevolver) {
    await inventarioService.registrarEntradaPorDevolucion({
      idProducto: item.id_producto,
      idUsuario,
      cantidad: item.cantidad,
      idVenta: ventaDevolucion.id_venta,
    });
  }

  return ventaDevolucion;
}

// Obtiene una venta por su id interno
async function obtenerVentaPorId(idVenta) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('id_venta', idVenta)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar la venta', 500);
  }

  if (!data) {
    throw new ErrorApp('Venta no encontrada', 404);
  }

  return data;
}

// Obtiene una venta por folio, con su detalle completo (T-24)
async function obtenerVentaPorFolio(folio) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, detalle_venta(*)')
    .eq('folio', folio)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar la venta', 500);
  }

  if (!data) {
    throw new ErrorApp('Venta no encontrada', 404);
  }

  return data;
}

// Obtiene venta con detalle por id (uso interno para cobro)
async function obtenerVentaConDetalle(idVenta) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, detalle_venta(*)')
    .eq('id_venta', idVenta)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar la venta', 500);
  }

  if (!data) {
    throw new ErrorApp('Venta no encontrada', 404);
  }

  return data;
}

module.exports = {
  crearVenta,
  agregarDetalle,
  eliminarDetalle,
  aplicarDescuento,
  cobrarVenta,
  procesarDevolucion,
  obtenerVentaPorFolio,
  obtenerVentaConDetalle,
};
