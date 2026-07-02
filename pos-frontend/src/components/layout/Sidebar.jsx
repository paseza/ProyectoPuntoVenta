import { NavLink } from 'react-router-dom';
import { useSession } from '../../hooks/useSession.js';

const MODULOS = [
  { ruta: '/ventas', etiqueta: 'Ventas', icono: '🛒', roles: ['cajero', 'supervisor', 'admin'] },
  { ruta: '/productos', etiqueta: 'Productos', icono: '📦', roles: ['admin'] },
  { ruta: '/corte-caja', etiqueta: 'Corte de caja', icono: '💰', roles: ['supervisor', 'admin'] },
];

export default function Sidebar() {
  const { usuario } = useSession();
  const modulosVisibles = MODULOS.filter((modulo) => modulo.roles.includes(usuario?.rol));

  return (
    <aside className="flex w-20 flex-shrink-0 flex-col gap-1 border-r border-gray-200 bg-white p-2 md:w-24 md:p-3 lg:w-56 lg:p-4">
      <div className="mb-2 flex items-center gap-2 px-2 py-2">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-700 text-sm font-bold text-white">
          PV
        </span>
        <span className="hidden truncate text-sm font-bold text-primary-900 lg:inline">
          Punto de Venta
        </span>
      </div>
      <span className="mb-1 hidden px-2 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:block">
        Módulos
      </span>
      {modulosVisibles.map((modulo) => (
        <NavLink
          key={modulo.ruta}
          to={modulo.ruta}
          title={modulo.etiqueta}
          className={({ isActive }) =>
            `flex min-h-[44px] items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:justify-start ${
              isActive
                ? 'bg-primary-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-institucional-grisClaro hover:text-primary-800'
            }`
          }
        >
          <span className="text-lg leading-none">{modulo.icono}</span>
          <span className="hidden truncate lg:inline">{modulo.etiqueta}</span>
        </NavLink>
      ))}
    </aside>
  );
}
