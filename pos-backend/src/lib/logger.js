// Logger centralizado simple. Sustituible por winston/pino sin cambiar las llamadas.
const logger = {
  info: (mensaje, contexto = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${mensaje}`, contexto);
  },
  error: (mensaje, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${mensaje}`, error);
  },
  warn: (mensaje, contexto = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${mensaje}`, contexto);
  },
};

module.exports = logger;
