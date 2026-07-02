// Esquemas de validación para el módulo de inventario
const { z } = require('zod');

const entradaInventarioSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  costoUnitario: z.number().nonnegative().optional(),
});

const ajusteInventarioSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidadFinal: z.number().int().nonnegative('La cantidad final no puede ser negativa'),
  motivo: z.string().min(1, 'El motivo del ajuste es obligatorio'),
});

module.exports = {
  entradaInventarioSchema,
  ajusteInventarioSchema,
};
