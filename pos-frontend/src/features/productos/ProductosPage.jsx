import { useMemo, useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import ProductoTable from './components/ProductoTable.jsx';
import ProductoForm from './components/ProductoForm.jsx';
import { useCategorias, useCambiarEstadoProducto, useProductos } from './hooks/useProductos.js';

export default function ProductosPage() {
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productoCambiarEstado, setProductoCambiarEstado] = useState(null);

  const { data: productos = [], isLoading } = useProductos(busqueda);
  const { data: categorias = [] } = useCategorias();
  const cambiarEstado = useCambiarEstadoProducto();

  const categoriasPorId = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id_categoria, c.nombre])),
    [categorias]
  );

  const estadisticas = useMemo(() => {
    const activos = productos.filter((p) => p.activo).length;
    return {
      total: productos.length,
      activos,
      inactivos: productos.length - activos,
      categorias: categorias.length,
    };
  }, [productos, categorias]);

  function manejarBusqueda(valor) {
    setBusquedaInput(valor);
    if (valor.length === 0 || valor.length >= 2) {
      setBusqueda(valor);
    }
  }

  function abrirNuevo() {
    setProductoEditar(null);
    setFormularioAbierto(true);
  }

  function abrirEdicion(producto) {
    setProductoEditar(producto);
    setFormularioAbierto(true);
  }

  function confirmarCambioEstado() {
    if (!productoCambiarEstado) return;
    cambiarEstado.mutate({
      idProducto: productoCambiarEstado.id_producto,
      activo: !productoCambiarEstado.activo,
    });
    setProductoCambiarEstado(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-primary-900">Productos</h1>
        <Button onClick={abrirNuevo}>Nuevo producto</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard etiqueta="Total productos" valor={estadisticas.total} icono="📦" tono="azul" />
        <StatCard etiqueta="Activos" valor={estadisticas.activos} icono="✅" tono="verde" />
        <StatCard etiqueta="Inactivos" valor={estadisticas.inactivos} icono="🚫" tono="gris" />
        <StatCard etiqueta="Categorías" valor={estadisticas.categorias} icono="🏷️" tono="azul" />
      </div>

      <Input
        placeholder="Buscar por nombre o código de barras..."
        value={busquedaInput}
        onChange={(e) => manejarBusqueda(e.target.value)}
        className="max-w-sm"
      />

      <ProductoTable
        productos={productos}
        categoriasPorId={categoriasPorId}
        cargando={isLoading}
        onEditar={abrirEdicion}
        onCambiarEstado={setProductoCambiarEstado}
      />

      <ProductoForm
        abierto={formularioAbierto}
        onCerrar={() => setFormularioAbierto(false)}
        productoEditar={productoEditar}
      />

      <ConfirmDialog
        abierto={Boolean(productoCambiarEstado)}
        titulo={productoCambiarEstado?.activo ? 'Desactivar producto' : 'Reactivar producto'}
        mensaje={
          productoCambiarEstado?.activo
            ? `¿Desactivar "${productoCambiarEstado?.nombre}"? Dejará de aparecer en la terminal de ventas.`
            : `¿Reactivar "${productoCambiarEstado?.nombre}"?`
        }
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setProductoCambiarEstado(null)}
      />
    </div>
  );
}
