// Middleware que valida req.body contra un schema Zod.
// Si la validación falla, responde 400 con el detalle del campo específico que falló.
function validateMiddleware(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const primerError = resultado.error.errors[0];
      const campo = primerError.path.join('.') || '(body)';

      return res.status(400).json({
        success: false,
        error: `Campo inválido "${campo}": ${primerError.message}`,
      });
    }

    // Sobrescribe req.body con los datos ya parseados/transformados por Zod
    req.body = resultado.data;
    next();
  };
}

module.exports = validateMiddleware;
