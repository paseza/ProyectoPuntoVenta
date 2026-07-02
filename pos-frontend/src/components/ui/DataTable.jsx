export default function DataTable({ columnas, data, renderFila, cargando = false }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-institucional-grisClaro">
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary-900"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {cargando && (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-6 text-center text-gray-400">
                Cargando...
              </td>
            </tr>
          )}
          {!cargando && data.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-6 text-center text-gray-400">
                Sin resultados
              </td>
            </tr>
          )}
          {!cargando && data.map((item, index) => renderFila(item, index))}
        </tbody>
      </table>
    </div>
  );
}
