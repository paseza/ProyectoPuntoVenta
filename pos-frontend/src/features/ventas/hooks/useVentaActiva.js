import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '../../../lib/apiClient.js';
import {
  agregarDetalle,
  buscarProductoPorCodigo,
  buscarProductosPorNombre,
  cobrarVenta,
  crearVenta,
} from '../api/ventas.api.js';

// Maneja el carrito de la venta activa en memoria. El carrito se construye
// completamente en el cliente para que agregar/quitar/cambiar cantidades sea
// instantáneo (spec 5.2: <300ms); la venta y su detalle se registran en el
// backend hasta el momento del cobro (TF-18), evitando líneas duplicadas por
// producto en detalle_venta.
export function useVentaActiva() {
  const [items, setItems] = useState([]);
  const [avisoNoEncontrado, setAvisoNoEncontrado] = useState(null);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [ticket, setTicket] = useState(null);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0),
    [items]
  );
  const total = subtotal;

  function agregarProductoAlCarrito(producto) {
    setItems((prev) => {
      const existente = prev.find((item) => item.idProducto === producto.id_producto);
      if (existente) {
        return prev.map((item) =>
          item.idProducto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          idProducto: producto.id_producto,
          codigoBarras: producto.codigo_barras,
          nombre: producto.nombre,
          precioUnitario: producto.precio_venta,
          cantidad: 1,
        },
      ];
    });
  }

  async function buscarYAgregar(texto) {
    const termino = texto.trim();
    if (!termino) return;
    setAvisoNoEncontrado(null);

    try {
      const [producto] = await buscarProductoPorCodigo(termino);
      if (producto) {
        agregarProductoAlCarrito(producto);
        return;
      }
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) throw err;
    }

    const coincidencias = await buscarProductosPorNombre(termino);
    if (coincidencias.length > 0) {
      agregarProductoAlCarrito(coincidencias[0]);
      return;
    }

    setAvisoNoEncontrado('Producto no encontrado');
  }

  function cambiarCantidad(idProducto, nuevaCantidad) {
    if (nuevaCantidad <= 0) return;
    setItems((prev) =>
      prev.map((item) => (item.idProducto === idProducto ? { ...item, cantidad: nuevaCantidad } : item))
    );
  }

  function eliminarItem(idProducto) {
    setItems((prev) => prev.filter((item) => item.idProducto !== idProducto));
  }

  function limpiarTicket() {
    setTicket(null);
  }

  async function cobrar({ pagoEfectivo, pagoTarjeta }) {
    setProcesandoCobro(true);
    try {
      const venta = await crearVenta();
      for (const item of items) {
        // eslint-disable-next-line no-await-in-loop
        await agregarDetalle(venta.id_venta, { idProducto: item.idProducto, cantidad: item.cantidad });
      }
      const ventaCobrada = await cobrarVenta(venta.id_venta, { pagoEfectivo, pagoTarjeta });

      setTicket({
        folio: ventaCobrada.folio,
        fecha: ventaCobrada.created_at || new Date().toISOString(),
        items,
        subtotal: ventaCobrada.subtotal,
        descuentoMonto: ventaCobrada.descuento_monto,
        total: ventaCobrada.total,
        pagoEfectivo: ventaCobrada.pago_efectivo,
        pagoTarjeta: ventaCobrada.pago_tarjeta,
        cambio: ventaCobrada.cambio,
      });
      setItems([]);
      toast.success(`Venta registrada — Folio ${ventaCobrada.folio}`);
      return true;
    } finally {
      setProcesandoCobro(false);
    }
  }

  return {
    items,
    subtotal,
    total,
    avisoNoEncontrado,
    procesandoCobro,
    ticket,
    buscarYAgregar,
    cambiarCantidad,
    eliminarItem,
    cobrar,
    limpiarTicket,
  };
}
