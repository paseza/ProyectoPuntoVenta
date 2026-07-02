import { useState } from 'react';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import PinAuthModal from '../../auth/components/PinAuthModal.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { useGenerarCorte } from '../hooks/useCorteCaja.js';

// El backend solo calcula ventas_efectivo/tarjeta/devoluciones y efectivo_esperado
// al generar el corte (no existe un endpoint de "vista previa"), por lo que la
// diferencia solo puede mostrarse después de confirmar, no en tiempo real antes de enviar.
export default function FormularioCorte({ turno, onCorteGenerado }) {
  const [efectivoContado, setEfectivoContado] = useState('');
  const [autorizacionAbierta, setAutorizacionAbierta] = useState(false);
  const generarCorte = useGenerarCorte();

  const valorNumerico = Number(efectivoContado);
  const esValido = efectivoContado !== '' && !Number.isNaN(valorNumerico) && valorNumerico >= 0;

  async function confirmarConSupervisor({ supervisorUsuario, supervisorPin }) {
    setAutorizacionAbierta(false);
    try {
      const corte = await generarCorte.mutateAsync({
        efectivoContado: valorNumerico,
        supervisorUsuario,
        supervisorPin,
      });
      onCorteGenerado(corte);
    } catch {
      // El error ya se notifica globalmente vía apiClient (TF-32).
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-card">
      <div className="flex justify-between rounded-lg bg-institucional-grisClaro px-3 py-2 text-sm text-gray-600">
        <span>Fondo inicial del turno</span>
        <span className="font-semibold text-gray-800">{formatCurrency(turno.fondo_inicial)}</span>
      </div>

      <Input
        label="Efectivo contado físicamente"
        type="number"
        min="0"
        step="0.01"
        value={efectivoContado}
        onChange={(e) => setEfectivoContado(e.target.value)}
      />

      <Button
        onClick={() => setAutorizacionAbierta(true)}
        disabled={!esValido || generarCorte.isPending}
        className="self-end"
      >
        {generarCorte.isPending ? 'Cerrando turno...' : 'Cerrar turno'}
      </Button>

      <PinAuthModal
        abierto={autorizacionAbierta}
        onCerrar={() => setAutorizacionAbierta(false)}
        onAutorizado={confirmarConSupervisor}
        titulo="Autorización de supervisor para cerrar turno"
      />
    </div>
  );
}
