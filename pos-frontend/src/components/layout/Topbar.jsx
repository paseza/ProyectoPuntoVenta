import { useState } from 'react';
import { useSession } from '../../hooks/useSession.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useTurnoActivo } from '../../features/ventas/hooks/useTurnoActivo.js';
import { formatDate } from '../../utils/formatDate.js';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

export default function Topbar() {
  const { usuario } = useSession();
  const { cerrarSesion } = useAuth();
  const { data: turno } = useTurnoActivo();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <header className="flex h-16 flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      <span className="hidden text-sm font-semibold text-primary-900 sm:inline">Punto de Venta</span>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2 md:gap-4">
        {turno && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
            Turno abierto desde {formatDate(turno.apertura_at)}
          </span>
        )}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{usuario?.nombre || usuario?.usuario}</p>
          <p className="text-xs capitalize text-gray-500">{usuario?.rol}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>

      <ConfirmDialog
        abierto={confirmando}
        titulo="Cerrar sesión"
        mensaje="¿Seguro que quieres cerrar tu sesión?"
        onConfirmar={cerrarSesion}
        onCancelar={() => setConfirmando(false)}
      />
    </header>
  );
}
