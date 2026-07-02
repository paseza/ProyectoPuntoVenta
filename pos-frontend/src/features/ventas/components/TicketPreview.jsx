import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';

const NOMBRE_NEGOCIO = 'ITH Sistemas y Computación';

export default function TicketPreview({ ticket, onCerrar }) {
  if (!ticket) return null;

  return (
    <Modal abierto={Boolean(ticket)} onCerrar={onCerrar} titulo={`Venta registrada — Folio ${ticket.folio}`}>
      <div
        id="ticket-imprimible"
        className="mx-auto flex w-full max-w-[80mm] flex-col gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none"
      >
        <div className="text-center">
          <p className="font-semibold text-primary-900">{NOMBRE_NEGOCIO}</p>
          <p className="text-xs text-gray-500">Folio: {ticket.folio}</p>
          <p className="text-xs text-gray-500">{formatDate(ticket.fecha)}</p>
        </div>

        <hr className="border-dashed" />

        <ul className="flex flex-col gap-1">
          {ticket.items.map((item) => (
            <li key={item.idProducto} className="flex justify-between gap-2">
              <span className="flex-1">
                {item.cantidad} × {item.nombre}
              </span>
              <span>{formatCurrency(item.cantidad * item.precioUnitario)}</span>
            </li>
          ))}
        </ul>

        <hr className="border-dashed" />

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(ticket.subtotal)}</span>
        </div>
        {ticket.descuentoMonto > 0 && (
          <div className="flex justify-between">
            <span>Descuento</span>
            <span>-{formatCurrency(ticket.descuentoMonto)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(ticket.total)}</span>
        </div>

        <hr className="border-dashed" />

        {ticket.pagoEfectivo > 0 && (
          <div className="flex justify-between">
            <span>Efectivo</span>
            <span>{formatCurrency(ticket.pagoEfectivo)}</span>
          </div>
        )}
        {ticket.pagoTarjeta > 0 && (
          <div className="flex justify-between">
            <span>Tarjeta</span>
            <span>{formatCurrency(ticket.pagoTarjeta)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Cambio</span>
          <span>{formatCurrency(ticket.cambio)}</span>
        </div>

        <hr className="border-dashed" />

        <p className="text-center text-xs">¡Gracias por su compra!</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCerrar}>
          Cerrar
        </Button>
        <Button onClick={() => window.print()}>Imprimir ticket</Button>
      </div>
    </Modal>
  );
}
