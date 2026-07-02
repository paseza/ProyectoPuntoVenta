// Servicio de reportes.
// Usa las vistas v_stock_status y v_resumen_turno del schema.sql para
// servir los datos de los reportes sin lógica de agregación en el backend.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');

// Reporte de ventas por rango de fechas (T-31, HU-14)
async function reporteVentas({ fechaInicio, fechaFin }) {
  if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
    throw new ErrorApp('La fecha de inicio no puede ser posterior a la fecha de fin', 400);
  }

  let queryVentas = supabase
    .from('ventas')
    .select('total, pago_efectivo, pago_tarjeta, created_at')
    .eq('estado', 'cerrada')
    .is('id_venta_origen', null); // Excluir notas de devolución del total de ventas

  if (fechaInicio) queryVentas = queryVentas.gte('created_at', fechaInicio);
  if (fechaFin) {
    const fin = new Date(fechaFin);
    fin.setDate(fin.getDate() + 1);
    queryVentas = queryVentas.lt('created_at', fin.toISOString());
  }

  const { data: ventas, error: errorVentas } = await queryVentas;

  if (errorVentas) {
    throw new ErrorApp('No se pudo generar el reporte de ventas', 500);
  }

  // Top 5 productos más vendidos en el período
  let queryTop = supabase
    .from('detalle_venta')
    .select('id_producto, cantidad, productos(nombre)');

  if (fechaInicio || fechaFin) {
    // Filtrar por ventas del período
    let queryFolios = supabase
      .from('ventas')
      .select('id_venta')
      .eq('estado', 'cerrada')
      .is('id_venta_origen', null);

    if (fechaInicio) queryFolios = queryFolios.gte('created_at', fechaInicio);
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setDate(fin.getDate() + 1);
      queryFolios = queryFolios.lt('created_at', fin.toISOString());
    }

    const { data: folios } = await queryFolios;
    const idsVentas = (folios || []).map((v) => v.id_venta);

    if (idsVentas.length > 0) {
      queryTop = queryTop.in('id_venta', idsVentas);
    }
  }

  const { data: detalles } = await queryTop;

  // Agrupar por producto y sumar cantidades
  const mapaProductos = {};
  (detalles || []).forEach((d) => {
    const nombre = d.productos?.nombre || `Producto #${d.id_producto}`;
    if (!mapaProductos[d.id_producto]) {
      mapaProductos[d.id_producto] = { idProducto: d.id_producto, nombre, cantidadTotal: 0 };
    }
    mapaProductos[d.id_producto].cantidadTotal += d.cantidad;
  });

  const top5 = Object.values(mapaProductos)
    .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
    .slice(0, 5);

  const totalTransacciones = ventas.length;
  const montoTotal = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalEfectivo = ventas.reduce((acc, v) => acc + v.pago_efectivo, 0);
  const totalTarjeta = ventas.reduce((acc, v) => acc + v.pago_tarjeta, 0);

  return {
    totalTransacciones,
    montoTotal,
    desglosePago: {
      efectivo: totalEfectivo,
      tarjeta: totalTarjeta,
    },
    top5ProductosMasVendidos: top5,
    periodo: { fechaInicio: fechaInicio || null, fechaFin: fechaFin || null },
  };
}

// Reporte de inventario actual (T-32, HU-15) — usa la vista v_stock_status
async function reporteInventario() {
  const { data, error } = await supabase
    .from('v_stock_status')
    .select('*')
    .order('estatus')
    .order('nombre');

  if (error) {
    throw new ErrorApp('No se pudo generar el reporte de inventario', 500);
  }

  return data;
}

module.exports = {
  reporteVentas,
  reporteInventario,
};
