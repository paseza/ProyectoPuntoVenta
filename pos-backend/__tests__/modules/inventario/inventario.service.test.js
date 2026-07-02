// Escenario del spec: HU-09 (entrada de mercancía) y la regla de negocio implícita
// en inventario.service.js — una salida de inventario nunca puede dejar el stock
// en un valor negativo (protege contra vender más unidades de las disponibles).
const { crearQueryBuilderMock } = require('../../helpers/supabaseMock');

jest.mock('../../../src/config/supabase.client', () => ({ from: jest.fn() }));

const supabase = require('../../../src/config/supabase.client');
const inventarioService = require('../../../src/modules/inventario/inventario.service');

describe('inventario.service — stock insuficiente al vender', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('rechaza la salida con error 400 cuando la cantidad vendida supera el stock disponible', async () => {
    const productoBuilder = crearQueryBuilderMock({ data: { stock_actual: 3 }, error: null });
    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'productos') return productoBuilder;
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    await expect(
      inventarioService.registrarSalidaPorVenta({
        idProducto: 42,
        idUsuario: 1,
        cantidad: 5,
        idVenta: 101,
      })
    ).rejects.toMatchObject({
      message: 'La operación dejaría el stock en un valor negativo',
      codigoHttp: 400,
      esErrorApp: true,
    });

    expect(productoBuilder.eq).toHaveBeenCalledWith('id_producto', 42);
  });

  test('permite la salida y registra el movimiento cuando el stock es suficiente', async () => {
    const productoBuilder = crearQueryBuilderMock({ data: { stock_actual: 10 }, error: null });
    const movimientoInsertado = {
      id_movimiento: 900,
      id_producto: 42,
      id_usuario: 1,
      tipo: 'salida',
      cantidad: -3,
      stock_anterior: 10,
      stock_nuevo: 7,
      motivo: 'Venta',
      id_venta: 101,
    };
    const movimientoBuilder = crearQueryBuilderMock({ data: movimientoInsertado, error: null });

    supabase.from.mockImplementation((tabla) => {
      if (tabla === 'productos') return productoBuilder;
      if (tabla === 'movimientos_inventario') return movimientoBuilder;
      throw new Error(`Tabla no esperada en este test: ${tabla}`);
    });

    const resultado = await inventarioService.registrarSalidaPorVenta({
      idProducto: 42,
      idUsuario: 1,
      cantidad: 3,
      idVenta: 101,
    });

    expect(resultado).toEqual(movimientoInsertado);
    expect(movimientoBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'salida',
        cantidad: -3,
        stock_anterior: 10,
        stock_nuevo: 7,
      })
    );
  });

  test('rechaza con error 404 cuando el producto no existe', async () => {
    const productoBuilder = crearQueryBuilderMock({ data: null, error: null });
    supabase.from.mockImplementation(() => productoBuilder);

    await expect(
      inventarioService.registrarSalidaPorVenta({
        idProducto: 999,
        idUsuario: 1,
        cantidad: 1,
        idVenta: 101,
      })
    ).rejects.toMatchObject({
      message: 'Producto no encontrado',
      codigoHttp: 404,
    });
  });
});
