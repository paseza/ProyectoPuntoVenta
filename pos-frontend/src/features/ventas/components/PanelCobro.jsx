import { useMemo, useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export default function PanelCobro({ abierto, onCerrar, total, onConfirmar, procesando }) {
  const [efectivo, setEfectivo] = useState('');
  const [tarjeta, setTarjeta] = useState('');

  const montoEfectivo = Number(efectivo) || 0;
  const montoTarjeta = Number(tarjeta) || 0;
  const totalPagado = montoEfectivo + montoTarjeta;
  const cambio = useMemo(() => Math.max(0, montoEfectivo - (total - montoTarjeta)), [montoEfectivo, montoTarjeta, total]);
  const pagoInsuficiente = totalPagado < total;

  function cerrar() {
    setEfectivo('');
    setTarjeta('');
    onCerrar();
  }

  async function confirmar() {
    if (pagoInsuficiente) return;
    const exito = await onConfirmar({ pagoEfectivo: montoEfectivo, pagoTarjeta: montoTarjeta });
    if (exito) {
      setEfectivo('');
      setTarjeta('');
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Cobrar venta">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3 ring-1 ring-inset ring-primary-100">
          <span className="text-sm font-medium text-primary-800">Total a pagar</span>
          <span className="text-xl font-bold text-primary-900">{formatCurrency(total)}</span>
        </div>

        <Input
          label="Efectivo"
          type="number"
          min="0"
          step="0.01"
          value={efectivo}
          onChange={(e) => setEfectivo(e.target.value)}
          autoFocus
        />
        <Input
          label="Tarjeta"
          type="number"
          min="0"
          step="0.01"
          value={tarjeta}
          onChange={(e) => setTarjeta(e.target.value)}
        />

        <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 ring-1 ring-inset ring-green-100">
          <span className="text-sm font-medium text-green-800">Cambio</span>
          <span className="text-lg font-bold text-green-900">{formatCurrency(cambio)}</span>
        </div>

        {pagoInsuficiente && (totalPagado > 0 || efectivo !== '' || tarjeta !== '') && (
          <p className="text-sm text-red-600">Pago insuficiente</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={cerrar}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={pagoInsuficiente || procesando}>
            {procesando ? 'Procesando...' : 'Confirmar cobro'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
