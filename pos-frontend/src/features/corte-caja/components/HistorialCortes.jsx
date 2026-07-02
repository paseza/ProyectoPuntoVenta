import { useState } from 'react';
import DataTable from '../../../components/ui/DataTable.jsx';
import Input from '../../../components/ui/Input.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';
import { useHistorialCortes } from '../hooks/useCorteCaja.js';

const COLUMNAS = ['Fecha', 'Supervisor', 'Ventas totales', 'Diferencia'];

export default function HistorialCortes() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const { data: cortes = [], isLoading } = useHistorialCortes({ fechaInicio, fechaFin });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Input
          label="Desde"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <Input label="Hasta" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </div>

      <DataTable
        columnas={COLUMNAS}
        data={cortes}
        cargando={isLoading}
        renderFila={(corte) => (
          <tr key={corte.id_corte} className="transition-colors hover:bg-primary-50/40">
            <td className="px-4 py-2 text-gray-600">{formatDate(corte.created_at)}</td>
            <td className="px-4 py-2 font-medium text-gray-800">{corte.usuarios?.nombre || '—'}</td>
            <td className="px-4 py-2 font-semibold text-gray-800">{formatCurrency(corte.ventas_efectivo + corte.ventas_tarjeta)}</td>
            <td className={`px-4 py-2 font-semibold ${corte.diferencia < 0 ? 'text-red-600' : corte.diferencia > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {corte.diferencia > 0 ? '+' : corte.diferencia < 0 ? '-' : ''}
              {formatCurrency(Math.abs(corte.diferencia))}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
