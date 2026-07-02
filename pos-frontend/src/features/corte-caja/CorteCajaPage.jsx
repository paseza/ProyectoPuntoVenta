import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { useTurnoActivo } from '../ventas/hooks/useTurnoActivo.js';
import FormularioCorte from './components/FormularioCorte.jsx';
import ResumenTurno from './components/ResumenTurno.jsx';
import HistorialCortes from './components/HistorialCortes.jsx';

const PESTANAS = [
  { id: 'corte', etiqueta: 'Corte' },
  { id: 'historial', etiqueta: 'Historial' },
];

export default function CorteCajaPage() {
  const [pestana, setPestana] = useState('corte');
  const [corteGenerado, setCorteGenerado] = useState(null);
  const { data: turno, isLoading } = useTurnoActivo();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-primary-900">Corte de caja</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {PESTANAS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPestana(tab.id)}
            className={`min-h-[44px] border-b-2 px-4 text-sm font-semibold transition-colors ${
              pestana === tab.id
                ? 'border-primary-700 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.etiqueta}
          </button>
        ))}
      </div>

      {pestana === 'corte' && (
        <div className="max-w-lg">
          {corteGenerado ? (
            <div className="flex flex-col gap-4">
              <ResumenTurno corte={corteGenerado} />
              <p className="text-sm text-gray-500">
                La terminal quedó bloqueada para nuevas ventas hasta abrir un nuevo turno.
              </p>
              <div className="flex gap-2">
                <Button variante="secundario" onClick={() => setCorteGenerado(null)}>
                  Ver formulario
                </Button>
                <Button onClick={() => window.print()}>Imprimir corte</Button>
              </div>
            </div>
          ) : isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : turno ? (
            <FormularioCorte turno={turno} onCorteGenerado={setCorteGenerado} />
          ) : (
            <p className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              No hay turno activo. Abre un turno desde la terminal de ventas para generar un corte.
            </p>
          )}
        </div>
      )}

      {pestana === 'historial' && <HistorialCortes />}
    </div>
  );
}
