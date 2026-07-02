const TONOS = {
  azul: 'bg-primary-50 text-primary-700',
  gris: 'bg-institucional-grisClaro text-institucional-gris',
  verde: 'bg-green-50 text-green-700',
  amarillo: 'bg-yellow-50 text-yellow-700',
  rojo: 'bg-red-50 text-red-700',
};

// Tarjeta de estadística puramente presentacional: recibe datos ya calculados
// por la página (no hace fetch propio), para no introducir nuevas llamadas a la API.
export default function StatCard({ etiqueta, valor, icono, tono = 'azul' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card">
      {icono && (
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-lg ${TONOS[tono] || TONOS.azul}`}>
          {icono}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">{etiqueta}</p>
        <p className="truncate text-xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  );
}
