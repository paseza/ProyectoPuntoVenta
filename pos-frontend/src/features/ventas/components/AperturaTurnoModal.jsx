import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useAbrirTurno } from '../hooks/useTurnoActivo.js';

export default function AperturaTurnoModal({ abierto, onCerrar }) {
  const [fondoInicial, setFondoInicial] = useState('');
  const abrirTurno = useAbrirTurno();

  const valorNumerico = Number(fondoInicial);
  const esValido = fondoInicial !== '' && !Number.isNaN(valorNumerico) && valorNumerico >= 0;

  async function confirmar() {
    if (!esValido) return;
    try {
      await abrirTurno.mutateAsync(valorNumerico);
      setFondoInicial('');
      onCerrar();
    } catch {
      // El error ya se muestra vía toast global (TF-32); el modal permanece abierto para reintentar.
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Abrir turno">
      <div className="flex flex-col gap-4">
        <Input
          label="Fondo inicial de caja"
          type="number"
          min="0"
          step="0.01"
          value={fondoInicial}
          onChange={(e) => setFondoInicial(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!esValido || abrirTurno.isPending}>
            {abrirTurno.isPending ? 'Abriendo...' : 'Abrir turno'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
