const VARIANTES = {
  ok: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  activo: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  bajo: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  agotado: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  inactivo: 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200',
};

export default function Badge({ variante = 'ok', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANTES[variante] || VARIANTES.ok}`}>
      {children}
    </span>
  );
}
