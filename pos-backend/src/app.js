// Configuración principal de Express.
// Carga env primero para que cualquier módulo que importe config/env.js
// encuentre las variables ya validadas.
require('./config/env');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const router = require('./routes/index');
const errorHandlerMiddleware = require('./middlewares/errorHandler.middleware');
const logger = require('./lib/logger');

const openapiDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));

const app = express();


// --- Documentación Swagger/OpenAPI ---
// Montada antes de helmet() para que su Content-Security-Policy por defecto
// no bloquee los estilos/scripts inline que usa swagger-ui-express.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.get('/api-docs.json', (_req, res) => res.json(openapiDocument));

// --- Seguridad ---
app.use(helmet());

// --- CORS: ajustar origenes según entorno de despliegue ---
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- Parseo de JSON ---
app.use(express.json());

// --- Log de cada request (solo en desarrollo) ---
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// --- Healthcheck (sin autenticación) ---
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { estado: 'ok', timestamp: new Date().toISOString() } });
});

// --- Rutas del sistema ---
app.use('/api', router);

// --- Ruta no encontrada ---
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// --- Manejo global de errores (debe ir al final) ---
app.use(errorHandlerMiddleware);

module.exports = app;
