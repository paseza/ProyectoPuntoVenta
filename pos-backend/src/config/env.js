// Valida que todas las variables de entorno necesarias estén presentes.
// dotenv.config() ya fue llamado en server.js antes de cargar este módulo.
const variablesRequeridas = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
];

const faltantes = variablesRequeridas.filter((variable) => !process.env[variable]);

if (faltantes.length > 0) {
  console.error(
    `ERROR DE CONFIGURACIÓN: faltan las siguientes variables de entorno: ${faltantes.join(', ')}\n` +
      'Crea un archivo .env basado en .env.example antes de iniciar el servidor.'
  );
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiracionHoras: process.env.JWT_EXPIRACION_HORAS || '12h',
  minutosInactividadMax: Number(process.env.MINUTOS_INACTIVIDAD_MAX || 15),
  limiteDescuentoPct: Number(process.env.LIMITE_DESCUENTO_PCT || 30),
};
