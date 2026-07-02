// Controller de productos y categorías
const productosService = require('./productos.service');

// ---------- Categorías ----------

// GET /api/categorias
async function listarCategorias(req, res) {
  const categorias = await productosService.listarCategorias();
  res.status(200).json({ success: true, data: categorias });
}

// POST /api/categorias
async function crearCategoria(req, res) {
  const categoria = await productosService.crearCategoria(req.body);
  res.status(201).json({ success: true, data: categoria });
}

// ---------- Productos ----------

// POST /api/productos
async function crear(req, res) {
  const producto = await productosService.crearProducto(req.body);
  res.status(201).json({ success: true, data: producto });
}

// GET /api/productos?codigo=...&buscar=...
async function buscar(req, res) {
  const { codigo, buscar: textoBusqueda } = req.query;
  const productos = await productosService.buscarProductos({ codigo, buscar: textoBusqueda });
  res.status(200).json({ success: true, data: productos });
}

// GET /api/productos/:id
async function obtenerPorId(req, res) {
  const producto = await productosService.obtenerProductoPorId(Number(req.params.id));
  res.status(200).json({ success: true, data: producto });
}

// PUT /api/productos/:id
async function actualizar(req, res) {
  const producto = await productosService.actualizarProducto(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data: producto });
}

// DELETE /api/productos/:id  (desactivar, no eliminar físico)
async function desactivar(req, res) {
  const producto = await productosService.desactivarProducto(Number(req.params.id));
  res.status(200).json({ success: true, data: producto });
}

// PUT /api/productos/:id/reactivar
async function reactivar(req, res) {
  const producto = await productosService.reactivarProducto(Number(req.params.id));
  res.status(200).json({ success: true, data: producto });
}

module.exports = {
  listarCategorias,
  crearCategoria,
  crear,
  buscar,
  obtenerPorId,
  actualizar,
  desactivar,
  reactivar,
};
