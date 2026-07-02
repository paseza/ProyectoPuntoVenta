import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import PinPad from './PinPad.jsx';
import { autorizarSupervisor } from '../api/auth.api.js';
import { ApiError } from '../../../lib/apiClient.js';

// Modal de re-autorización de supervisor (TF-10). Reutilizado por descuentos,
// devoluciones y corte de caja sin cerrar la sesión del cajero.
export default function PinAuthModal({ abierto, onCerrar, onAutorizado, titulo = 'Se requiere autorización de supervisor' }) {
  const [usuario, setUsuario] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [verificando, setVerificando] = useState(false);

  function cerrar() {
    setUsuario('');
    setPin('');
    setError(null);
    onCerrar();
  }

  async function confirmar() {
    setError(null);
    setVerificando(true);
    try {
      const supervisor = await autorizarSupervisor({ usuario, pin });
      // Las acciones que consumen este modal (descuento, devolución, corte de caja)
      // vuelven a exigir usuario+PIN en su propio endpoint, así que se reenvían junto
      // con la identidad ya validada para no pedirlos dos veces al supervisor.
      onAutorizado({ supervisor, supervisorUsuario: usuario, supervisorPin: pin });
      setUsuario('');
      setPin('');
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'PIN de supervisor inválido';
      setError(mensaje || 'PIN de supervisor inválido');
      setPin('');
    } finally {
      setVerificando(false);
    }
  }

  const puedeConfirmar = usuario.trim().length > 0 && pin.length >= 4 && !verificando;

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo={titulo}>
      <div className="flex flex-col gap-4">
        <Input
          label="Usuario del supervisor"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoFocus
        />
        <div className="flex justify-center">
          <PinPad value={pin} onChange={setPin} autoFocusInput={false} />
        </div>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={cerrar}>
            Cancelar
          </Button>
          <Button variante="primario" onClick={confirmar} disabled={!puedeConfirmar}>
            {verificando ? 'Verificando...' : 'Autorizar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
