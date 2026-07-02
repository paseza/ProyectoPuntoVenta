import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useTurnoActivo } from './hooks/useTurnoActivo.js';
import { useVentaActiva } from './hooks/useVentaActiva.js';
import AperturaTurnoModal from './components/AperturaTurnoModal.jsx';
import BuscadorProducto from './components/BuscadorProducto.jsx';
import CarritoVenta from './components/CarritoVenta.jsx';
import PanelCobro from './components/PanelCobro.jsx';
import TicketPreview from './components/TicketPreview.jsx';

export default function VentasPage() {
  const { data: turno, isLoading: cargandoTurno } = useTurnoActivo();
  const [aperturaAbierta, setAperturaAbierta] = useState(false);
  const [cobroAbierto, setCobroAbierto] = useState(false);

  const {
    items,
    total,
    avisoNoEncontrado,
    procesandoCobro,
    ticket,
    buscarYAgregar,
    cambiarCantidad,
    eliminarItem,
    cobrar,
    limpiarTicket,
  } = useVentaActiva();

  const hayTurno = Boolean(turno);
  const controlesDeshabilitados = !hayTurno || cargandoTurno;

  async function manejarCobro(datosCobro) {
    try {
      const exito = await cobrar(datosCobro);
      if (exito) {
        setCobroAbierto(false);
      }
      return exito;
    } catch {
      return false;
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {!hayTurno && !cargandoTurno && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800 ring-1 ring-inset ring-yellow-200">
          <span>No hay turno activo. Abre un turno para comenzar a vender.</span>
          <Button onClick={() => setAperturaAbierta(true)}>Abrir turno</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          etiqueta="Turno"
          valor={hayTurno ? 'Abierto' : 'Cerrado'}
          icono="🕒"
          tono={hayTurno ? 'verde' : 'rojo'}
        />
        <StatCard etiqueta="Artículos en carrito" valor={items.length} icono="🛒" tono="azul" />
        <StatCard etiqueta="Total de la venta" valor={formatCurrency(total)} icono="💵" tono="azul" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <BuscadorProducto
            onBuscar={buscarYAgregar}
            avisoNoEncontrado={avisoNoEncontrado}
            deshabilitado={controlesDeshabilitados}
          />
        </div>

        <div className="flex w-full flex-shrink-0 flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-card lg:w-96">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900">Carrito</h2>

          <CarritoVenta items={items} onCambiarCantidad={cambiarCantidad} onEliminarItem={eliminarItem} />

          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-base font-medium text-gray-600">Total</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>

          <Button
            onClick={() => setCobroAbierto(true)}
            disabled={controlesDeshabilitados || items.length === 0}
            className="w-full"
          >
            Cobrar
          </Button>
        </div>
      </div>

      <AperturaTurnoModal abierto={aperturaAbierta} onCerrar={() => setAperturaAbierta(false)} />

      <PanelCobro
        abierto={cobroAbierto}
        onCerrar={() => setCobroAbierto(false)}
        total={total}
        onConfirmar={manejarCobro}
        procesando={procesandoCobro}
      />

      <TicketPreview ticket={ticket} onCerrar={limpiarTicket} />
    </div>
  );
}
