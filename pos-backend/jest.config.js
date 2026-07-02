// Configuración de Jest para pos-backend.
// El proyecto es CommonJS puro (require/module.exports), así que no se necesita
// Babel ni ningún transform: Jest ejecuta el código directamente sobre Node.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  collectCoverageFrom: ['src/modules/**/*.service.js'],
};
