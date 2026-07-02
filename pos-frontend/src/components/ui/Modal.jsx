import { useEffect } from 'react';

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-md' }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-institucional-azulOscuro/40 p-4 backdrop-blur-sm">
      <div className={`w-full ${ancho} rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-gray-50 px-5 py-3">
          <h2 className="text-base font-semibold text-primary-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
