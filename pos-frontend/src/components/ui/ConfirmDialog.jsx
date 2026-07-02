import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ abierto, titulo, mensaje, onConfirmar, onCancelar, variante = 'peligro' }) {
  return (
    <Modal abierto={abierto} onCerrar={onCancelar} titulo={titulo}>
      <p className="text-sm text-gray-600">{mensaje}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variante={variante} onClick={onConfirmar}>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}
