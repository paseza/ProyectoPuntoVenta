// Esquemas de validación para el módulo de corte de caja
const { z } = require('zod');

const corteCajaSchema = z.object({
  efectivoContado: z.number().nonnegative('El efectivo contado no puede ser negativo'),
  supervisorUsuario: z.string().min(1, 'Se requiere el usuario del supervisor'),
  supervisorPin: z.string().min(1, 'Se requiere el PIN del supervisor'),
  notas: z.string().optional(),
});

const filtroFechaSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});

module.exports = {
  corteCajaSchema,
  filtroFechaSchema,
};
