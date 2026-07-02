import DataTable from '../../../components/ui/DataTable.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

const COLUMNAS = ['Código', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estatus', 'Acciones'];

export default function ProductoTable({ productos, categoriasPorId, cargando, onEditar, onCambiarEstado }) {
  return (
    <DataTable
      columnas={COLUMNAS}
      data={productos}
      cargando={cargando}
      renderFila={(producto) => (
        <tr
          key={producto.id_producto}
          className={`transition-colors hover:bg-primary-50/40 ${producto.activo ? '' : 'opacity-50'}`}
        >
          <td className="px-4 py-2 font-mono text-xs text-gray-600">{producto.codigo_barras}</td>
          <td className="px-4 py-2 font-medium text-gray-800">{producto.nombre}</td>
          <td className="px-4 py-2">{categoriasPorId[producto.id_categoria] || '—'}</td>
          <td className="px-4 py-2 font-semibold text-gray-800">{formatCurrency(producto.precio_venta)}</td>
          <td className="px-4 py-2">{producto.stock_actual}</td>
          <td className="px-4 py-2">
            <Badge variante={producto.activo ? 'activo' : 'inactivo'}>
              {producto.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </td>
          <td className="flex gap-2 px-4 py-2">
            <button
              type="button"
              onClick={() => onEditar(producto)}
              className="min-h-[44px] rounded-lg px-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onCambiarEstado(producto)}
              className={`min-h-[44px] rounded-lg px-2 text-sm font-medium transition-colors hover:bg-gray-100 ${
                producto.activo ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {producto.activo ? 'Desactivar' : 'Reactivar'}
            </button>
          </td>
        </tr>
      )}
    />
  );
}
