const TECLAS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'borrar', '0', 'limpiar',
];

// Campo de captura de PIN alfanumérico (letras y números). Se usa tanto en el
// login (TF-08) como en el modal de re-autorización de supervisor (TF-10).
// El teclado numérico es un atajo táctil para dígitos; letras se escriben con
// el teclado físico directamente en el campo de texto.
export default function PinPad({ value, onChange, maxLength = 10, autoFocusInput = true }) {
  function manejarTecla(tecla) {
    if (tecla === 'borrar') {
      onChange(value.slice(0, -1));
      return;
    }
    if (tecla === 'limpiar') {
      onChange('');
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + tecla);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="password"
        inputMode="text"
        autoFocus={autoFocusInput}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, maxLength))}
        maxLength={maxLength}
        placeholder="PIN"
        className="w-44 rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl tracking-[0.3em] text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
      <div className="grid grid-cols-3 gap-2">
        {TECLAS.map((tecla) => (
          <button
            key={tecla}
            type="button"
            onClick={() => manejarTecla(tecla)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-institucional-grisClaro text-lg font-semibold text-primary-900 transition-colors hover:bg-primary-100 active:bg-primary-200"
          >
            {tecla === 'borrar' ? '⌫' : tecla === 'limpiar' ? 'C' : tecla}
          </button>
        ))}
      </div>
    </div>
  );
}
