// Escenarios de HU-13 (spec.md): conciliación de efectivo al cerrar turno.
// turnos.service y usuarios.service se mockean como módulos completos; solo se
// simula la tabla `ventas` (para calcular ventas_efectivo/tarjeta/devoluciones)
// y el insert en `corte_caja`.
const { crearQueryBuilderMock } = require('../../helpers/supabaseMock');

jest.mock('../../../src/config/supabase.client', () => ({ from: jest.fn() }));
jest.mock('../../../src/modules/turnos/turnos.service');
jest.mock('../../../src/modules/usuarios/usuarios.service');

const supabase = require('../../../src/config/supabase.client');
const turnosService = require('../../../src/modules/turnos/turnos.service');
const usuariosService = require('../../../src/modules/usuarios/usuarios.service');
const corteCajaService = require('../../../src/modules/corte-caja/corteCaja.service');

function mockVentasYCorte(ventasSimuladas, corteEsperado) {
  const ventasBuilder = crearQueryBuilderMock({ data: ventasSimuladas, error: null });
  const corteBuilder = crearQueryBuilderMock({ data: corteEsperado, error: null });

  supabase.from.mockImplementation((tabla) => {
    if (tabla === 'ventas') return ventasBuilder;
    if (tabla === 'corte_caja') return corteBuilder;
    throw new Error(`Tabla no esperada en este test: ${tabla}`);
  });

  return { ventasBuilder, corteBuilder };
}

describe('corteCaja.service — generarCorte (HU-13)', () => {
  beforeEach(() => {
    usuariosService.verificarAutorizacionSupervisor.mockResolvedValue({
      id_usuario: 2,
      nombre: 'María López',
      rol: 'supervisor',
    });
    turnosService.obtenerTurnoActivo.mockResolvedValue({ id_turno: 14, fondo_inicial: 500 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('escenario 1: efectivo contado igual al esperado → diferencia $0.00', async () => {
    const ventasSimuladas = [
      { pago_efectivo: 1200, pago_tarjeta: 800, total: 2000, id_venta_origen: null, estado: 'cerrada' },
    ];
    const { corteBuilder } = mockVentasYCorte(ventasSimuladas, { id_corte: 1, diferencia: 0 });

    await corteCajaService.generarCorte({
      efectivoContado: 1700,
      supervisorUsuario: 'msupervisor',
      supervisorPin: '5678',
    });

    expect(corteBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        fondo_inicial: 500,
        ventas_efectivo: 1200,
        ventas_tarjeta: 800,
        total_devoluciones: 0,
        efectivo_esperado: 1700,
        efectivo_contado: 1700,
        diferencia: 0,
      })
    );
  });

  test('escenario 2: falta efectivo → diferencia negativa (-$50.00, faltante)', async () => {
    const ventasSimuladas = [
      { pago_efectivo: 1200, pago_tarjeta: 800, total: 2000, id_venta_origen: null, estado: 'cerrada' },
    ];
    const { corteBuilder } = mockVentasYCorte(ventasSimuladas, { id_corte: 2, diferencia: -50 });

    await corteCajaService.generarCorte({
      efectivoContado: 1650,
      supervisorUsuario: 'msupervisor',
      supervisorPin: '5678',
    });

    expect(corteBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ efectivo_esperado: 1700, efectivo_contado: 1650, diferencia: -50 })
    );
  });

  test('escenario 3: sobra efectivo → diferencia positiva (+$50.00, sobrante)', async () => {
    const ventasSimuladas = [
      { pago_efectivo: 1200, pago_tarjeta: 800, total: 2000, id_venta_origen: null, estado: 'cerrada' },
    ];
    const { corteBuilder } = mockVentasYCorte(ventasSimuladas, { id_corte: 3, diferencia: 50 });

    await corteCajaService.generarCorte({
      efectivoContado: 1750,
      supervisorUsuario: 'msupervisor',
      supervisorPin: '5678',
    });

    expect(corteBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ efectivo_esperado: 1700, efectivo_contado: 1750, diferencia: 50 })
    );
  });

  test('escenario 5: descuenta devoluciones en efectivo del esperado', async () => {
    const ventasSimuladas = [
      { pago_efectivo: 2000, pago_tarjeta: 0, total: 2000, id_venta_origen: null, estado: 'cerrada' },
      // Nota de devolución: tiene id_venta_origen y se registra como pago_efectivo del reembolso.
      { pago_efectivo: 300, pago_tarjeta: 0, total: 300, id_venta_origen: 55, estado: 'cerrada' },
    ];
    const { corteBuilder } = mockVentasYCorte(ventasSimuladas, { id_corte: 4, diferencia: 0 });

    await corteCajaService.generarCorte({
      efectivoContado: 2200,
      supervisorUsuario: 'msupervisor',
      supervisorPin: '5678',
    });

    expect(corteBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ventas_efectivo: 2000,
        total_devoluciones: 300,
        // esperado = fondo (500) + ventas efectivo (2000) - devoluciones (300) = 2200
        efectivo_esperado: 2200,
      })
    );
  });

  test('propaga el rechazo cuando el PIN de supervisor es inválido, sin consultar ventas', async () => {
    usuariosService.verificarAutorizacionSupervisor.mockRejectedValue(
      Object.assign(new Error('Usuario o PIN incorrectos'), { codigoHttp: 401, esErrorApp: true })
    );

    await expect(
      corteCajaService.generarCorte({
        efectivoContado: 1700,
        supervisorUsuario: 'malo',
        supervisorPin: '0000',
      })
    ).rejects.toMatchObject({ message: 'Usuario o PIN incorrectos', codigoHttp: 401 });

    expect(turnosService.obtenerTurnoActivo).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
