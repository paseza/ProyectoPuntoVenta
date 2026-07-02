// Servicio de productos y categorías.
// Contiene la lógica de negocio y el acceso a Supabase para `productos` y `categorias`.
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');

// ---------- Categorías ----------

async function listarCategorias() {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre');

  if (error) {
    throw new ErrorApp('No se pudo obtener la lista de categorías', 500);
  }

  return data;
}

async function crearCategoria({ nombre, descripcion }) {
  const { data, error } = await supabase
    .from('categorias')
    .insert({ nombre, descripcion })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ErrorApp('Ya existe una categoría con ese nombre', 409);
    }
    throw new ErrorApp('No se pudo crear la categoría', 500);
  }

  return data;
}

// ---------- Productos ----------

// Crea un producto. Responde 409 si el código de barras ya existe (HU-01).
async function crearProducto({
  nombre,
  codigoBarras,
  precioVenta,
  costoUnitario,
  idCategoria,
  unidadMedida,
  stockMinimo,
}) {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre,
      codigo_barras: codigoBarras,
      precio_venta: precioVenta,
      costo_unitario: costoUnitario ?? null,
      id_categoria: idCategoria ?? null,
      unidad_medida: unidadMedida,
      stock_minimo: stockMinimo,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ErrorApp('Este código ya existe', 409);
    }
    throw new ErrorApp('No se pudo crear el producto', 500);
  }

  return data;
}

// Busca productos activos por código de barras exacto o nombre parcial (HU-01, HU-03)
async function buscarProductos({ codigo, buscar }) {
  let query = supabase.from('productos').select('*').eq('activo', true);

  if (codigo) {
    query = query.eq('codigo_barras', codigo);
  }

  if (buscar) {
    query = query.ilike('nombre', `%${buscar}%`);
  }

  const { data, error } = await query.order('nombre');

  if (error) {
    throw new ErrorApp('No se pudo realizar la búsqueda de productos', 500);
  }

  if (codigo && data.length === 0) {
    throw new ErrorApp('Producto no encontrado', 404);
  }

  return data;
}

async function obtenerProductoPorId(idProducto) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_producto', idProducto)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo consultar el producto', 500);
  }

  if (!data) {
    throw new ErrorApp('Producto no encontrado', 404);
  }

  return data;
}

// Actualiza un producto. No afecta ventas previas porque detalle_venta
// guarda su propio precio_unitario, independiente del precio actual (HU-02).
async function actualizarProducto(idProducto, cambios) {
  await obtenerProductoPorId(idProducto);

  const cambiosDb = {};
  if (cambios.nombre !== undefined) cambiosDb.nombre = cambios.nombre;
  if (cambios.precioVenta !== undefined) cambiosDb.precio_venta = cambios.precioVenta;
  if (cambios.costoUnitario !== undefined) cambiosDb.costo_unitario = cambios.costoUnitario;
  if (cambios.idCategoria !== undefined) cambiosDb.id_categoria = cambios.idCategoria;
  if (cambios.unidadMedida !== undefined) cambiosDb.unidad_medida = cambios.unidadMedida;
  if (cambios.stockMinimo !== undefined) cambiosDb.stock_minimo = cambios.stockMinimo;
  cambiosDb.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('productos')
    .update(cambiosDb)
    .eq('id_producto', idProducto)
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo actualizar el producto', 500);
  }

  return data;
}

// Desactiva un producto sin eliminarlo (HU-03)
async function desactivarProducto(idProducto) {
  await obtenerProductoPorId(idProducto);

  const { data, error } = await supabase
    .from('productos')
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq('id_producto', idProducto)
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo desactivar el producto', 500);
  }

  return data;
}

// Reactiva un producto previamente desactivado (HU-03)
async function reactivarProducto(idProducto) {
  await obtenerProductoPorId(idProducto);

  const { data, error } = await supabase
    .from('productos')
    .update({ activo: true, updated_at: new Date().toISOString() })
    .eq('id_producto', idProducto)
    .select('*')
    .single();

  if (error) {
    throw new ErrorApp('No se pudo reactivar el producto', 500);
  }

  return data;
}

module.exports = {
  listarCategorias,
  crearCategoria,
  crearProducto,
  buscarProductos,
  obtenerProductoPorId,
  actualizarProducto,
  desactivarProducto,
  reactivarProducto,
};
