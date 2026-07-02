// Error de aplicación con código HTTP asociado.
// Los servicios lanzan ErrorApp para errores de negocio esperados (404, 400, 409, etc.).
// Cualquier otro error (no instancia de ErrorApp) se trata como error interno (500)
// y nunca se expone su mensaje real al cliente.
class ErrorApp extends Error {
  constructor(mensaje, codigoHttp = 400) {
    super(mensaje);
    this.codigoHttp = codigoHttp;
    this.esErrorApp = true;
  }
}

module.exports = ErrorApp;
