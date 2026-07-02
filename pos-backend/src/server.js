// Punto de entrada del servidor.
// dotenv debe cargarse PRIMERO, antes de cualquier otro require,
// para que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén disponibles
// cuando supabase.client.js se inicialice.
require('dotenv').config();

const app = require('./app');
const { port } = require('./config/env');
const logger = require('./lib/logger');

app.listen(port, () => {
  logger.info(`Servidor POS escuchando en http://localhost:${port}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
