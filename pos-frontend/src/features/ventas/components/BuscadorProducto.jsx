import { useRef, useState } from 'react';
import Input from '../../../components/ui/Input.jsx';

export default function BuscadorProducto({ onBuscar, avisoNoEncontrado, deshabilitado }) {
  const [texto, setTexto] = useState('');
  const inputRef = useRef(null);

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!texto.trim() || deshabilitado) return;
    await onBuscar(texto);
    setTexto('');
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-1">
      <Input
        ref={inputRef}
        placeholder="🔍 Escanea o escribe un código de barras / nombre del producto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={deshabilitado}
        autoFocus
        className="min-h-[52px] text-base"
      />
      {avisoNoEncontrado && (
        <span className="text-sm text-red-600" role="alert">
          {avisoNoEncontrado}
        </span>
      )}
    </form>
  );
}
