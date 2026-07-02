// Esquemas de validación para el módulo de ventas
const { z } = require('zod');

const agregarDetalleSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
});

const aplicarDescuentoSchema = z.object({
  tipo: z.enum(['porcentaje', 'monto']),
  valor: z.number().positive('El valor del descuento debe ser mayor a 0'),
  supervisorUsuario: z.string().min(1, 'Se requiere el usuario del supervisor'),
  supervisorPin: z.string().min(1, 'Se requiere el PIN del supervisor'),
});

const cobrarVentaSchema = z.object({
  pagoEfectivo: z.number().nonnegative().default(0),
  pagoTarjeta: z.number().nonnegative().default(0),
});

const devolucionSchema = z.object({
  idsDetalle: z.array(z.number().int().positive()).min(1, 'Debes indicar al menos un ítem a devolver'),
  supervisorUsuario: z.string().min(1, 'Se requiere el usuario del supervisor'),
  supervisorPin: z.string().min(1, 'Se requiere el PIN del supervisor'),
});

module.exports = {
  agregarDetalleSchema,
  aplicarDescuentoSchema,
  cobrarVentaSchema,
  devolucionSchema,
};
