// Envuelve un controller async para capturar cualquier error y pasarlo a next().
// Esto centraliza el try/catch exigido por skill-ith-backend.md sin repetirlo
// en cada controller individual.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
