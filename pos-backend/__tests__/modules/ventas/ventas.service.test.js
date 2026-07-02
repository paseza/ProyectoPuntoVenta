// Escenario del spec: HU-04/HU-05 (recalcular subtotal/total al modificar el carrito)
// y HU-07 (cobro con cambio calculado). productos.service e inventario.service se
// mockean como módulos completos para aislar únicamente la aritmética de ventas.service.
const { crearQueryBuilderMock } = require('../../helpers/supabaseMock');

jest.mock('../../../src/config/supabase.client', () => ({ from: jest.fn() }));
jest.mock('../../../src/modules/productos/productos.service');
jest.mock('../../../src/modules/inventario/inventario.service');

const supabase = require('../../../src/config/supabase.client');
const productosService = require('../../../src/modules/productos/productos.service');
const inventarioService = require('../../../src/modules/inventario/inventario.service');
const ventasService = require('../../../src/modules/ventas/ventas.service');

describe('ventas.service — cálculo de totales al agregar ítems (HU-04/HU-05)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('recalcula subtotal y total (subtotal - descuento) al agregar un ítem', async () => {
    const ventaAbiertaBuilder = crearQueryBuilderMock({
      data: { id_venta: 101, estado: 'abierta' },
      error: null,
    });
    const detalleInsertado = {
      id_detalle: 1,
      id_venta: 101,
      id_producto: 42,
      precio_unitario: 20,
      cantidad: 3,
      subtotal: 60,
    };
    const detalleInsertBuilder = crearQueryBuilderMock({ data: detalleInsertado, error: null });
    const detalleSelectBuilder = crearQueryBuilderMock({ data: [{ subtotal: 60 }], error: null });
    // La venta ya tenía un descuento de $10 aplicado previamente (HU-06); recalcularTotales debe respetarlo.
    const descuentoBuilder = crearQueryBuilderMock({ data: { descuento_monto: 10 }, error: null });
    const updateBuilder = crearQueryBuilderMock({ data: null, error: null });

    const colaVentas = [ventaAbiertaBuilder, descuentoBuilder, updateBuilder];
    const colaDetalle = [detalleInsertBuilder, detalleSelectBuilder];

    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'ventas') return colaVentas.shift();
      if (tabla === 'detalle_venta') return colaDetalle.shift();
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    productosService.obtenerProductoPorId.mockResolvedValue({
      id_producto: 42,
      activo: true,
      precio_venta: 20,
    });

    const detalle = await ventasService.agregarDetalle(101, { idProducto: 42, cantidad: 3 });

    expect(detalle).toEqual(detalleInsertado);
    expect(detalleInsertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id_venta: 101,
        id_producto: 42,
        precio_unitario: 20,
        cantidad: 3,
        subtotal: 60,
      })
    );
    // subtotal = 60 (suma de detalle_venta); total = 60 - 10 de descuento = 50
    expect(updateBuilder.update).toHaveBeenCalledWith({ subtotal: 60, total: 50 });
  });

  test('rechaza agregar un ítem a una venta que ya fue cerrada o anulada', async () => {
    const ventaCerradaBuilder = crearQueryBuilderMock({
      data: { id_venta: 101, estado: 'cerrada' },
      error: null,
    });
    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'ventas') return ventaCerradaBuilder;
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    await expect(
      ventasService.agregarDetalle(101, { idProducto: 42, cantidad: 1 })
    ).rejects.toMatchObject({
      message: 'No se puede modificar una venta que ya fue cerrada o anulada',
      codigoHttp: 400,
    });

    expect(productosService.obtenerProductoPorId).not.toHaveBeenCalled();
  });
});

describe('ventas.service — cálculo de cambio al cobrar (HU-07)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calcula el cambio correctamente con pago en efectivo mayor al total', async () => {
    const ventaConDetalleBuilder = crearQueryBuilderMock({
      data: {
        id_venta: 101,
        estado: 'abierta',
        total: 100,
        detalle_venta: [{ id_detalle: 1, id_producto: 42, cantidad: 2 }],
      },
      error: null,
    });
    const ventaCerrada = {
      id_venta: 101,
      folio: 'V-000101',
      total: 100,
      pago_efectivo: 150,
      pago_tarjeta: 0,
      cambio: 50,
      estado: 'cerrada',
    };
    const updateBuilder = crearQueryBuilderMock({ data: ventaCerrada, error: null });

    // La primera llamada a supabase.from('ventas') es obtenerVentaConDetalle (maybeSingle);
    // la segunda es el update final (single). Se resuelven en ese orden de invocación.
    const colaVentas = [ventaConDetalleBuilder, updateBuilder];
    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'ventas') return colaVentas.shift();
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    inventarioService.registrarSalidaPorVenta.mockResolvedValue({});

    const resultado = await ventasService.cobrarVenta(101, { pagoEfectivo: 150, pagoTarjeta: 0 }, 3);

    expect(resultado).toEqual(ventaCerrada);
    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ pago_efectivo: 150, pago_tarjeta: 0, cambio: 50, estado: 'cerrada' })
    );
    expect(inventarioService.registrarSalidaPorVenta).toHaveBeenCalledTimes(1);
  });

  test('rechaza el cobro cuando el pago no cubre el total de la venta', async () => {
    const ventaConDetalleBuilder = crearQueryBuilderMock({
      data: {
        id_venta: 101,
        estado: 'abierta',
        total: 100,
        detalle_venta: [{ id_detalle: 1, id_producto: 42, cantidad: 2 }],
      },
      error: null,
    });
    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'ventas') return ventaConDetalleBuilder;
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    await expect(
      ventasService.cobrarVenta(101, { pagoEfectivo: 50, pagoTarjeta: 0 }, 3)
    ).rejects.toMatchObject({
      message: 'El pago ($50.00) no cubre el total de la venta ($100.00)',
      codigoHttp: 400,
    });

    expect(inventarioService.registrarSalidaPorVenta).not.toHaveBeenCalled();
  });
});
