import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';

function colorDiferencia(diferencia) {
  if (diferencia > 0) return 'text-green-600';
  if (diferencia < 0) return 'text-red-600';
  return 'text-gray-500';
}

function signoDiferencia(diferencia) {
  if (diferencia > 0) return '+';
  if (diferencia < 0) return '-';
  return '';
}

export default function ResumenTurno({ corte }) {
  const filas = [
    ['Fondo inicial', formatCurrency(corte.fondo_inicial)],
    ['Ventas en efectivo', formatCurrency(corte.ventas_efectivo)],
    ['Ventas con tarjeta', formatCurrency(corte.ventas_tarjeta)],
    ['Devoluciones', `-${formatCurrency(corte.total_devoluciones)}`],
    ['Efectivo esperado', formatCurrency(corte.efectivo_esperado)],
    ['Efectivo contado', formatCurrency(corte.efectivo_contado)],
  ];

  return (
    <div
      id="corte-imprimible"
      className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-card print:rounded-none print:border-none print:p-0 print:shadow-none"
    >
      <p className="text-xs text-gray-500">
        Corte generado el {formatDate(corte.created_at)}
      </p>
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="flex justify-between text-sm">
          <span className="text-gray-600">{etiqueta}</span>
          <span className="font-medium text-gray-800">{valor}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base">
        <span className="font-semibold text-gray-700">Diferencia</span>
        <span className={`font-bold ${colorDiferencia(corte.diferencia)}`}>
          {signoDiferencia(corte.diferencia)}
          {formatCurrency(Math.abs(corte.diferencia))}
        </span>
      </div>
    </div>
  );
}
