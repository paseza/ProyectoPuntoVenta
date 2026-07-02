// Esquemas de validación para el módulo de productos
const { z } = require('zod');

const crearCategoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  descripcion: z.string().optional(),
});

const crearProductoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  codigoBarras: z.string().min(1, 'El código de barras es obligatorio'),
  precioVenta: z.number().positive('El precio de venta debe ser mayor a 0'),
  costoUnitario: z.number().nonnegative('El costo unitario no puede ser negativo').optional(),
  idCategoria: z.number().int().positive().optional(),
  unidadMedida: z.enum(['pza', 'kg', 'lt', 'caja', 'metro', 'otro']).default('pza'),
  stockMinimo: z.number().int().nonnegative().optional().default(0),
});

const actualizarProductoSchema = z.object({
  nombre: z.string().min(1).optional(),
  precioVenta: z.number().positive('El precio de venta debe ser mayor a 0').optional(),
  costoUnitario: z.number().nonnegative().optional(),
  idCategoria: z.number().int().positive().optional(),
  unidadMedida: z.enum(['pza', 'kg', 'lt', 'caja', 'metro', 'otro']).optional(),
  stockMinimo: z.number().int().nonnegative().optional(),
});

module.exports = {
  crearCategoriaSchema,
  crearProductoSchema,
  actualizarProductoSchema,
};
