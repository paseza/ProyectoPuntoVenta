// Esquemas de validación para el módulo de usuarios
const { z } = require('zod');

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  pin: z.string().min(4, 'El PIN debe tener al menos 4 dígitos').regex(/^\d+$/, 'El PIN solo puede contener números'),
  rol: z.enum(['cajero', 'supervisor', 'admin']).default('cajero'),
});

const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es obligatorio'),
  pin: z.string().min(1, 'El PIN es obligatorio'),
});

const autorizarSupervisorSchema = z.object({
  usuario: z.string().min(1, 'El usuario es obligatorio'),
  pin: z.string().min(1, 'El PIN es obligatorio'),
});

module.exports = {
  crearUsuarioSchema,
  loginSchema,
  autorizarSupervisorSchema,
};
