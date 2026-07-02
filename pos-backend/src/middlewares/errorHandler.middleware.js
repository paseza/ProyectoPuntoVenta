// Middleware global de manejo de errores.
// Cumple skill-ith-backend.md: nunca expone errores internos al cliente.
const logger = require('../lib/logger');

// eslint-disable-next-line no-unused-vars
function errorHandlerMiddleware(error, req, res, next) {
  // Errores de negocio esperados (lanzados con ErrorApp) sí exponen su mensaje,
  // porque fueron escritos para ser leídos por el usuario final.
  if (error.esErrorApp) {
    return res.status(error.codigoHttp).json({
      success: false,
      error: error.message,
    });
  }

  // Cualquier otro error es inesperado: se registra completo en el log
  // pero al cliente solo se le informa un mensaje genérico.
  logger.error('Error no controlado', { mensaje: error.message, stack: error.stack });

  return res.status(500).json({
    success: false,
    error: 'Ocurrió un error interno. Intenta de nuevo más tarde.',
  });
}

module.exports = errorHandlerMiddleware;
