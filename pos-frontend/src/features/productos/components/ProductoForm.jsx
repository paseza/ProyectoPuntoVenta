import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useCategorias, useCrearProducto, useActualizarProducto } from '../hooks/useProductos.js';
import { ApiError } from '../../../lib/apiClient.js';

const UNIDADES = ['pza', 'kg', 'lt', 'caja', 'metro', 'otro'];

const VACIO = {
  nombre: '',
  codigoBarras: '',
  idCategoria: '',
  precioVenta: '',
  costoUnitario: '',
  unidadMedida: 'pza',
  stockMinimo: '0',
};

// Formulario de alta (TF-12) y edición (TF-13) de producto. El backend
// distingue creación (POST, requiere código de barras) de edición (PUT, sin código).
export default function ProductoForm({ abierto, onCerrar, productoEditar }) {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const esEdicion = Boolean(productoEditar);
  const guardando = crear.isPending || actualizar.isPending;

  useEffect(() => {
    if (productoEditar) {
      setValores({
        nombre: productoEditar.nombre || '',
        codigoBarras: productoEditar.codigo_barras || '',
        idCategoria: productoEditar.id_categoria ? String(productoEditar.id_categoria) : '',
        precioVenta: String(productoEditar.precio_venta ?? ''),
        costoUnitario: String(productoEditar.costo_unitario ?? ''),
        unidadMedida: productoEditar.unidad_medida || 'pza',
        stockMinimo: String(productoEditar.stock_minimo ?? '0'),
      });
    } else {
      setValores(VACIO);
    }
    setErrores({});
  }, [productoEditar, abierto]);

  function actualizarCampo(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!valores.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!esEdicion && !valores.codigoBarras.trim()) {
      nuevosErrores.codigoBarras = 'El código de barras es obligatorio';
    }
    if (!valores.precioVenta || Number(valores.precioVenta) <= 0) {
      nuevosErrores.precioVenta = 'El precio de venta debe ser mayor a 0';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const payloadComun = {
      nombre: valores.nombre.trim(),
      precioVenta: Number(valores.precioVenta),
      costoUnitario: valores.costoUnitario ? Number(valores.costoUnitario) : undefined,
      idCategoria: valores.idCategoria ? Number(valores.idCategoria) : undefined,
      unidadMedida: valores.unidadMedida,
      stockMinimo: valores.stockMinimo ? Number(valores.stockMinimo) : 0,
    };

    try {
      if (esEdicion) {
        await actualizar.mutateAsync({ idProducto: productoEditar.id_producto, cambios: payloadComun });
      } else {
        await crear.mutateAsync({ ...payloadComun, codigoBarras: valores.codigoBarras.trim() });
      }
      onCerrar();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrores((prev) => ({ ...prev, codigoBarras: 'Este código ya existe' }));
      }
      // Otros errores ya se notifican globalmente vía apiClient (TF-32); el modal permanece abierto.
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'}>
      <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre*"
          value={valores.nombre}
          onChange={(e) => actualizarCampo('nombre', e.target.value)}
          error={errores.nombre}
        />

        {!esEdicion && (
          <Input
            label="Código de barras*"
            value={valores.codigoBarras}
            onChange={(e) => actualizarCampo('codigoBarras', e.target.value)}
            error={errores.codigoBarras}
          />
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Categoría</label>
          <select
            value={valores.idCategoria}
            onChange={(e) => actualizarCampo('idCategoria', e.target.value)}
            className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Sin categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Precio de venta*"
          type="number"
          step="0.01"
          min="0"
          value={valores.precioVenta}
          onChange={(e) => actualizarCampo('precioVenta', e.target.value)}
          error={errores.precioVenta}
        />

        <Input
          label="Costo"
          type="number"
          step="0.01"
          min="0"
          value={valores.costoUnitario}
          onChange={(e) => actualizarCampo('costoUnitario', e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Unidad de medida</label>
          <select
            value={valores.unidadMedida}
            onChange={(e) => actualizarCampo('unidadMedida', e.target.value)}
            className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {UNIDADES.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Stock mínimo"
          type="number"
          min="0"
          value={valores.stockMinimo}
          onChange={(e) => actualizarCampo('stockMinimo', e.target.value)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variante="secundario" onClick={onCerrar} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
