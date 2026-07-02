// Servicio de inventario.
// Cada cambio de stock se registra como un movimiento en `movimientos_inventario`.
// El trigger trg_mov_actualiza_stock en schema.sql actualiza productos.stock_actual
// automáticamente al insertar el movimiento, así que este servicio nunca actualiza
// productos.stock_actual directamente: siempre inserta el movimiento y deja que
// la base de datos propague el cambio, evitando inconsistencias.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');

// Obtiene el stock actual de un producto (usado para calcular stock_anterior/stock_nuevo)
async function obtenerStockActual(idProducto) {
  const { data, error } = await supabase
    .from('productos')
    .select('stock_actual')
    .eq('id_producto', idProducto)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar el stock del producto', 500);
  }

  if (!data) {
    throw new ErrorApp('Producto no encontrado', 404);
  }

  return data.stock_actual;
}

// Inserta un movimiento de inventario genérico.
// `cantidad` es la variación: positiva en entradas/devoluciones, negativa en salidas.
async function registrarMovimiento({ idProducto, idUsuario, tipo, cantidad, motivo, idVenta }) {
  const stockAnterior = await obtenerStockActual(idProducto);
  const stockNuevo = stockAnterior + cantidad;

  if (stockNuevo < 0) {
    throw new ErrorApp('La operación dejaría el stock en un valor negativo', 400);
  }

  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_producto: idProducto,
      id_usuario: idUsuario,
      tipo,
      cantidad,
      stock_anterior: stockAnterior,
      stock_nuevo: stockNuevo,
      motivo: motivo ?? null,
      id_venta: idVenta ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo registrar el movimiento de inventario', 500);
  }

  return data;
}

// Registra una entrada de mercancía (HU-09)
async function registrarEntrada({ idProducto, idUsuario, cantidad, costoUnitario }) {
  const movimiento = await registrarMovimiento({
    idProducto,
    idUsuario,
    tipo: 'entrada',
    cantidad,
    motivo: 'Entrada de mercancía',
  });

  // Si se proporcionó costo unitario, actualizamos el costo de referencia del producto
  if (costoUnitario !== undefined) {
    await supabase
      .from('productos')
      .update({ costo_unitario: costoUnitario, updated_at: new Date().toISOString() })
      .eq('id_producto', idProducto);
  }

  return movimiento;
}

// Registra un ajuste manual de inventario (HU-11): merma, robo, error de conteo
async function registrarAjuste({ idProducto, idUsuario, cantidadFinal, motivo }) {
  const stockAnterior = await obtenerStockActual(idProducto);
  const diferencia = cantidadFinal - stockAnterior;

  if (diferencia === 0) {
    throw new ErrorApp('La cantidad final es igual al stock actual; no hay ajuste que registrar', 400);
  }

  return registrarMovimiento({
    idProducto,
    idUsuario,
    tipo: 'ajuste',
    cantidad: diferencia,
    motivo,
  });
}

// Registra movimientos de salida por una venta cerrada (usado por ventas.service.js)
async function registrarSalidaPorVenta({ idProducto, idUsuario, cantidad, idVenta }) {
  return registrarMovimiento({
    idProducto,
    idUsuario,
    tipo: 'salida',
    cantidad: -Math.abs(cantidad),
    motivo: 'Venta',
    idVenta,
  });
}

// Registra movimientos de entrada por una devolución (usado por ventas.service.js)
async function registrarEntradaPorDevolucion({ idProducto, idUsuario, cantidad, idVenta }) {
  return registrarMovimiento({
    idProducto,
    idUsuario,
    tipo: 'devolucion',
    cantidad: Math.abs(cantidad),
    motivo: 'Devolución',
    idVenta,
  });
}

// Lista los movimientos de inventario, más recientes primero
async function listarMovimientos({ idProducto } = {}) {
  let query = supabase.from('movimientos_inventario').select('*').order('created_at', { ascending: false });

  if (idProducto) {
    query = query.eq('id_producto', idProducto);
  }

  const { data, error } = await query;

  if (error) {
    throw new ErrorApp('No se pudo obtener el historial de movimientos', 500);
  }

  return data;
}

// Obtiene productos con stock en estado "Bajo" o "Agotado" (HU-10), usando la vista v_stock_status
async function obtenerAlertasStock() {
  const { data, error } = await supabase
    .from('v_stock_status')
    .select('*')
    .neq('estatus', 'OK')
    .order('estatus');

  if (error) {
    throw new ErrorApp('No se pudo obtener las alertas de stock', 500);
  }

  return data;
}

module.exports = {
  registrarEntrada,
  registrarAjuste,
  registrarSalidaPorVenta,
  registrarEntradaPorDevolucion,
  listarMovimientos,
  obtenerAlertasStock,
  obtenerStockActual,
};
