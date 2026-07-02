import { useState } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency.js';

function CantidadInput({ item, onCambiarCantidad }) {
  const [valor, setValor] = useState(String(item.cantidad));

  function confirmar() {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) {
      setValor(String(item.cantidad));
      return;
    }
    onCambiarCantidad(item.idProducto, Math.floor(numero));
  }

  return (
    <input
      type="number"
      min="1"
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onBlur={confirmar}
      className="min-h-[44px] w-16 rounded-lg border border-gray-300 px-2 text-center text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
    />
  );
}

export default function CarritoVenta({ items, onCambiarCantidad, onEliminarItem }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-institucional-grisClaro/40 p-8 text-sm text-gray-400">
        El carrito está vacío
      </div>
    );
  }

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {items.map((item) => (
        <li
          key={item.idProducto}
          className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-primary-50/30"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">{item.nombre}</p>
            <p className="text-xs text-gray-500">{formatCurrency(item.precioUnitario)} c/u</p>
          </div>
          <CantidadInput item={item} onCambiarCantidad={onCambiarCantidad} />
          <span className="w-20 text-right text-sm font-semibold text-primary-800">
            {formatCurrency(item.cantidad * item.precioUnitario)}
          </span>
          <button
            type="button"
            onClick={() => onEliminarItem(item.idProducto)}
            aria-label={`Eliminar ${item.nombre}`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  );
}
