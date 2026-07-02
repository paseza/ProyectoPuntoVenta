# Sistema de Punto de Venta (POS) — ITH Sistemas y Computación

Sistema de punto de venta para comercio minorista: registro de ventas en terminal, catálogo de productos, control de inventario, apertura/cierre de turno con corte de caja, y reportes. Pensado para operarse desde una sola terminal (mostrador), con roles diferenciados de **cajero**, **supervisor** y **administrador**.

Este repositorio es un monorepo con dos proyectos independientes (`pos-backend` y `pos-frontend`) más la documentación funcional y el script de base de datos.

## Tabla de contenido

- [Descripción del proyecto](#descripción-del-proyecto)
- [Tecnologías usadas](#tecnologías-usadas)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Cómo correr el proyecto en desarrollo](#cómo-correr-el-proyecto-en-desarrollo)
- [Pruebas](#pruebas)
- [Documentación adicional](#documentación-adicional)

## Descripción del proyecto

El sistema cubre cinco módulos funcionales:

| Módulo | Qué hace |
|---|---|
| **Catálogo de productos** | Alta, edición de precio, desactivación/reactivación de productos (sin perder el historial de ventas) |
| **Terminal de ventas (POS)** | Búsqueda/escaneo de producto, carrito, descuentos autorizados por supervisor, cobro en efectivo/tarjeta/mixto, ticket imprimible, devoluciones |
| **Inventario** | Entradas de mercancía, ajustes manuales (merma/robo/conteo), alertas de stock bajo/agotado |
| **Turnos y corte de caja** | Apertura de turno con fondo inicial, cierre con conciliación de efectivo (esperado vs. contado) y autorización de supervisor |
| **Reportes** | Ventas por rango de fechas (desglose por método de pago, top 5 productos) y estado actual de inventario |

**Roles del sistema:**

- **Cajero** — opera la terminal de venta, registra transacciones y cobra.
- **Supervisor** — autoriza descuentos, devoluciones y accede al corte de caja.
- **Administrador** — gestiona catálogo, inventario, usuarios y reportes.

La especificación funcional completa (historias de usuario, criterios de aceptación, restricciones técnicas) está en [`spec.md`](spec.md).

## Tecnologías usadas

### Backend (`pos-backend`)

- **Node.js + Express** — API REST
- **Supabase** (PostgreSQL) como base de datos, vía `@supabase/supabase-js` con service role key
- **JWT** (`jsonwebtoken`) para autenticación por token, con expiración por tiempo e inactividad
- **Zod** para validación de esquemas de entrada
- **bcryptjs** para el hash del PIN de los usuarios
- **Helmet** + **CORS** para cabeceras de seguridad
- **swagger-ui-express** + **yamljs** — documentación OpenAPI interactiva
- **Jest** — pruebas unitarias (CommonJS puro, sin Babel)

### Frontend (`pos-frontend`)

- **React 18 + Vite**
- **Tailwind CSS** — estilos con tema institucional azul/gris
- **TanStack Query (React Query)** — manejo de datos remotos y caché
- **React Router v6** — enrutamiento con rutas protegidas por rol
- **Axios** — cliente HTTP centralizado
- **react-hot-toast** — notificaciones globales de éxito/error

### Base de datos

- **PostgreSQL 15+** (compatible con Supabase). Script de creación completo en [`database/schema.sql`](database/schema.sql).

## Estructura de carpetas

```
proyectoPuntoVenta/
├── database/
│   └── schema.sql              # Script de creación de la base de datos (PostgreSQL/Supabase)
├── spec.md                     # Especificación funcional (historias de usuario, criterios de aceptación)
├── plan.md                     # Plan técnico del proyecto
├── modelo_datos.md             # Modelo de datos
├── tasks.md                    # Tareas de implementación — backend
├── tasks-frontend.md           # Tareas de implementación — frontend
├── skill-ith-backend.md        # Convenciones de código del backend
│
├── pos-backend/
│   ├── src/
│   │   ├── app.js              # Configuración de Express (middlewares, rutas, Swagger UI)
│   │   ├── server.js           # Punto de entrada — levanta el servidor HTTP
│   │   ├── config/             # env.js (validación de variables de entorno), supabase.client.js
│   │   ├── docs/
│   │   │   └── openapi.yaml    # Especificación OpenAPI 3.0 completa (servida en /api-docs)
│   │   ├── lib/                # asyncHandler, ErrorApp, folioGenerator, logger
│   │   ├── middlewares/        # auth, requireRole, validate, errorHandler
│   │   ├── modules/            # Un módulo por dominio de negocio
│   │   │   ├── usuarios/       # Autenticación y gestión de usuarios
│   │   │   ├── productos/      # Catálogo y categorías
│   │   │   ├── turnos/         # Apertura y consulta de turno
│   │   │   ├── ventas/         # Terminal de ventas: carrito, descuentos, cobro, devoluciones
│   │   │   ├── inventario/     # Entradas, ajustes, movimientos y alertas de stock
│   │   │   ├── corte-caja/     # Cierre de turno y conciliación de efectivo
│   │   │   └── reportes/       # Reportes de ventas e inventario
│   │   │       # cada módulo sigue el patrón: *.routes.js → *.controller.js → *.service.js (+ *.schema.js)
│   │   └── routes/
│   │       └── index.js        # Registro centralizado de todas las rutas bajo /api
│   ├── __tests__/              # Pruebas Jest (mockean Supabase y servicios hermanos con jest.mock())
│   ├── jest.config.js
│   └── package.json
│
└── pos-frontend/
    ├── src/
    │   ├── main.jsx             # Entry point — providers globales (Query, Router, Session, Toaster)
    │   ├── App.jsx
    │   ├── lib/                 # apiClient.js (Axios + manejo de errores), queryClient.js
    │   ├── context/             # SessionContext (usuario, token, rol)
    │   ├── hooks/                # useSession
    │   ├── router/               # AppRouter, RutaProtegida (rutas protegidas por rol)
    │   ├── components/
    │   │   ├── layout/            # AppLayout, Sidebar, Topbar
    │   │   ├── ui/                 # Button, Input, Modal, Badge, DataTable, StatCard, etc.
    │   │   └── ErrorBoundary.jsx
    │   ├── features/
    │   │   ├── auth/               # LoginPage, PinPad, PinAuthModal (re-autorización de supervisor)
    │   │   ├── productos/          # Catálogo: tabla, formulario de alta/edición
    │   │   ├── ventas/             # Terminal de ventas: carrito, cobro, ticket, apertura de turno
    │   │   └── corte-caja/         # Cierre de turno, resumen, historial de cortes
    │   │       # cada feature sigue el patrón: *Page.jsx → components/ → hooks/ → api/
    │   ├── pages/                 # NotFound, AccesoNoPermitido
    │   └── utils/                  # formatCurrency, formatDate
    └── package.json
```

## Instalación

Requisitos previos:

- **Node.js 18+** y **npm**
- Una **cuenta y proyecto de Supabase** (o un PostgreSQL propio compatible con `database/schema.sql`)

### 1. Clonar y preparar la base de datos

Ejecuta el contenido de [`database/schema.sql`](database/schema.sql) en tu proyecto de Supabase (SQL Editor) o en tu instancia de PostgreSQL. Esto crea todas las tablas, vistas (`v_stock_status`) y triggers necesarios.

### 2. Backend

```bash
cd pos-backend
npm install
```

Crea un archivo `.env` en `pos-backend/` (ver [Variables de entorno](#variables-de-entorno) abajo).

### 3. Frontend

```bash
cd pos-frontend
npm install
cp .env.example .env
```

## Variables de entorno

### Backend (`pos-backend/.env`)

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `SUPABASE_URL` | Sí | — | URL de tu proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | — | Service role key de Supabase (acceso completo desde el backend; **nunca** exponerla en el frontend) |
| `JWT_SECRET` | Sí | — | Secreto usado para firmar los tokens JWT |
| `PORT` | No | `4000` | Puerto donde escucha el servidor Express |
| `NODE_ENV` | No | `development` | `development` \| `production` |
| `JWT_EXPIRACION_HORAS` | No | `12h` | Vigencia absoluta del token (formato aceptado por `jsonwebtoken`) |
| `MINUTOS_INACTIVIDAD_MAX` | No | `15` | Minutos de inactividad tras los cuales la sesión expira (spec 5.3) |
| `LIMITE_DESCUENTO_PCT` | No | `30` | Porcentaje máximo de descuento autorizable por un supervisor (HU-06) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Origen permitido por CORS (URL del frontend) |

El servidor valida estas variables al iniciar (`src/config/env.js`) y aborta con un mensaje claro si falta alguna obligatoria.

### Frontend (`pos-frontend/.env`)

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:4000/api` | URL base del backend (incluye el prefijo `/api`) |

## Cómo correr el proyecto en desarrollo

Necesitas dos terminales abiertas (backend y frontend corren por separado):

**Terminal 1 — Backend**

```bash
cd pos-backend
npm run dev
```

Levanta con `nodemon` en `http://localhost:4000` (o el `PORT` configurado). Endpoints útiles:

- Healthcheck: `http://localhost:4000/health`
- Documentación interactiva (Swagger UI): `http://localhost:4000/api-docs`
- Especificación OpenAPI cruda: `http://localhost:4000/api-docs.json`

**Terminal 2 — Frontend**

```bash
cd pos-frontend
npm run dev
```

Levanta con Vite en `http://localhost:5173`. El primer usuario debe crearse directamente contra el backend (`POST /api/usuarios`, requiere rol admin) o insertarse en la tabla `usuarios` de Supabase, ya que no hay usuarios sembrados por defecto.

## Pruebas

```bash
cd pos-backend
npm test
```

Corre la suite de Jest (`__tests__/`), que mockea Supabase y los servicios hermanos con `jest.mock()` para probar la lógica de negocio de forma aislada: cálculo de totales de venta, control de stock insuficiente, y conciliación del corte de caja.

## Documentación adicional

- [`MANUAL_USUARIO.md`](MANUAL_USUARIO.md) — manual de usuario en lenguaje sencillo (buscar productos, vender, corte de caja)
- [`spec.md`](spec.md) — especificación funcional completa (historias de usuario y criterios de aceptación)
- [`plan.md`](plan.md) — plan técnico
- [`modelo_datos.md`](modelo_datos.md) — modelo de datos
- [`tasks.md`](tasks.md) / [`tasks-frontend.md`](tasks-frontend.md) — desglose de tareas de implementación
- [`skill-ith-backend.md`](skill-ith-backend.md) — convenciones de código del backend
- `pos-backend/src/docs/openapi.yaml` — especificación OpenAPI (también disponible interactiva en `/api-docs` con el servidor corriendo)
