// Esquemas de validación para el módulo de turnos
const { z } = require('zod');

const aperturaTurnoSchema = z.object({
  fondoInicial: z.number().nonnegative('El fondo inicial no puede ser negativo'),
});

module.exports = {
  aperturaTurnoSchema,
};
