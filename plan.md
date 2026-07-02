# Plan de Implementación — Sistema Punto de Venta (POS)

**Versión:** 1.0
**Fecha:** 2026-06-30
**Basado en:** spec.md v1.0

---

## 1. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | **React 18 + Vite** | Build rápido, HMR instantáneo, ideal para terminal táctil con recarga frecuente en desarrollo |
| Estilos | **Tailwind CSS** | Velocidad de maquetado, consistente con pantallas densas en datos (POS) |
| Backend | **Node.js + Express** | API REST simple, ecosistema maduro, fácil de desplegar junto al frontend |
| Base de datos | **Supabase (PostgreSQL)** | Postgres gestionado + Auth + Realtime, reemplaza el SQLite local del spec original para permitir sincronización futura multi-sucursal |
| Autenticación | **Supabase Auth** (con PIN custom via RPC) | Se mantiene el modelo de roles (cajero/supervisor/admin) del spec sobre tablas propias, usando Supabase Auth solo para sesión de dispositivo/admin |
| Estado cliente | **React Query (TanStack Query)** | Cacheo y revalidación de datos del catálogo/ventas sin estado global complejo |
| Impresión de tickets | **react-to-print** + plantilla ESC/POS en backend | Cumple restricción 5.4 del spec (térmica 58/80mm) |
| Validación | **Zod** (compartido front/back) | Un solo esquema de validación reutilizado en formularios y endpoints |

> **Nota sobre offline-first:** el spec original pedía SQLite local. Al introducir Supabase, el modo offline-first se relega a v2 (vía IndexedDB + sync), documentado como decisión de alcance. Si la operación sin internet es un requisito duro para v1, debe discutirse antes de continuar.

---

## 2. Estructura de carpetas — Backend

```
pos-backend/
├── src/
│   ├── config/
│   │   ├── supabase.client.js        # cliente Supabase (service role)
│   │   └── env.js                    # carga y valida variables de entorno
│   │
│   ├── modules/
│   │   ├── productos/
│   │   │   ├── productos.routes.js
│   │   │   ├── productos.controller.js
│   │   │   ├── productos.service.js
│   │   │   └── productos.schema.js   # validación Zod
│   │   │
│   │   ├── ventas/
│   │   │   ├── ventas.routes.js
│   │   │   ├── ventas.controller.js
│   │   │   ├── ventas.service.js
│   │   │   └── ventas.schema.js
│   │   │
│   │   ├── inventario/
│   │   │   ├── inventario.routes.js
│   │   │   ├── inventario.controller.js
│   │   │   ├── inventario.service.js
│   │   │   └── inventario.schema.js
│   │   │
│   │   ├── corte-caja/
│   │   │   ├── corteCaja.routes.js
│   │   │   ├── corteCaja.controller.js
│   │   │   ├── corteCaja.service.js
│   │   │   └── corteCaja.schema.js
│   │   │
│   │   ├── turnos/
│   │   │   ├── turnos.routes.js
│   │   │   ├── turnos.controller.js
│   │   │   └── turnos.service.js
│   │   │
│   │   ├── usuarios/
│   │   │   ├── usuarios.routes.js
│   │   │   ├── usuarios.controller.js
│   │   │   └── usuarios.service.js
│   │   │
│   │   └── reportes/
│   │       ├── reportes.routes.js
│   │       ├── reportes.controller.js
│   │       └── reportes.service.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js        # valida sesión / PIN
│   │   ├── requireRole.middleware.js # cajero | supervisor | admin
│   │   ├── errorHandler.middleware.js
│   │   └── validate.middleware.js    # ejecuta schemas Zod
│   │
│   ├── lib/
│   │   ├── ticketPrinter.js          # formato ESC/POS
│   │   ├── folioGenerator.js         # consecutivos de venta
│   │   └── logger.js
│   │
│   ├── routes/
│   │   └── index.js                  # registra todos los módulos
│   │
│   ├── app.js                        # configuración Express (middlewares globales)
│   └── server.js                     # punto de entrada (listen)
│
├── tests/
│   ├── productos.test.js
│   ├── ventas.test.js
│   └── corteCaja.test.js
│
├── .env.example
├── .eslintrc.json
├── package.json
└── README.md
```

**Patrón por módulo:** `routes → controller → service`
`routes` define endpoints y aplica middlewares; `controller` traduce HTTP ↔ dominio; `service` contiene la lógica de negocio y las llamadas a Supabase. Ningún `controller` accede a la base de datos directamente.

---

## 3. Estructura de carpetas — Frontend

```
pos-frontend/
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── logo/
│   │
│   ├── components/
│   │   ├── ui/                       # componentes genéricos reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── DataTable.jsx
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Topbar.jsx
│   │       └── AppLayout.jsx
│   │
│   ├── features/
│   │   ├── productos/
│   │   │   ├── components/
│   │   │   │   ├── ProductoForm.jsx
│   │   │   │   └── ProductoTable.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useProductos.js    # React Query hooks
│   │   │   ├── api/
│   │   │   │   └── productos.api.js   # llamadas fetch al backend
│   │   │   └── ProductosPage.jsx
│   │   │
│   │   ├── ventas/                    # Terminal POS
│   │   │   ├── components/
│   │   │   │   ├── BuscadorProducto.jsx
│   │   │   │   ├── CarritoVenta.jsx
│   │   │   │   ├── PanelCobro.jsx
│   │   │   │   └── TicketPreview.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useVentaActiva.js
│   │   │   ├── api/
│   │   │   │   └── ventas.api.js
│   │   │   └── VentasPage.jsx
│   │   │
│   │   ├── inventario/
│   │   │   ├── components/
│   │   │   │   ├── MovimientoForm.jsx
│   │   │   │   └── AlertaStock.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useInventario.js
│   │   │   ├── api/
│   │   │   │   └── inventario.api.js
│   │   │   └── InventarioPage.jsx
│   │   │
│   │   ├── corte-caja/
│   │   │   ├── components/
│   │   │   │   ├── ResumenTurno.jsx
│   │   │   │   └── FormularioCorte.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useCorteCaja.js
│   │   │   ├── api/
│   │   │   │   └── corteCaja.api.js
│   │   │   └── CorteCajaPage.jsx
│   │   │
│   │   ├── reportes/
│   │   │   ├── components/
│   │   │   │   └── GraficoVentas.jsx
│   │   │   ├── api/
│   │   │   │   └── reportes.api.js
│   │   │   └── ReportesPage.jsx
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   └── PinPad.jsx
│   │       ├── hooks/
│   │       │   └── useAuth.js
│   │       └── LoginPage.jsx
│   │
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   ├── apiClient.js              # wrapper fetch/axios con base URL
│   │   └── queryClient.js            # configuración React Query
│   │
│   ├── hooks/                        # hooks globales no ligados a un feature
│   │   └── useSession.js
│   │
│   ├── context/
│   │   └── SessionContext.jsx        # turno activo, usuario logueado
│   │
│   ├── router/
│   │   └── AppRouter.jsx
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   └── formatDate.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

**Patrón:** organización por **feature** (no por tipo de archivo a nivel raíz). Cada carpeta de `features/` es autocontenida: tiene sus propios componentes, hooks y llamadas API. `components/` en la raíz solo aloja piezas verdaderamente genéricas usadas por más de un feature.

---

## 4. Convenciones de nombres

### 4.1 Archivos y carpetas

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | `PascalCase.jsx` | `CarritoVenta.jsx` |
| Hooks | `camelCase.js`, prefijo `use` | `useVentaActiva.js` |
| Servicios backend | `camelCase.service.js` | `ventas.service.js` |
| Rutas backend | `camelCase.routes.js` | `corteCaja.routes.js` |
| Schemas de validación | `camelCase.schema.js` | `productos.schema.js` |
| Carpetas de feature/módulo | `kebab-case` | `corte-caja/` |
| Archivos de utilidades | `camelCase.js` | `formatCurrency.js` |
| Tests | mismo nombre + `.test.js` | `ventas.test.js` |

### 4.2 Variables y funciones (JavaScript)

- **Variables y funciones:** `camelCase` → `calcularTotalVenta()`, `stockActual`
- **Componentes y clases:** `PascalCase` → `TicketPreview`, `VentaService`
- **Constantes globales / enums:** `UPPER_SNAKE_CASE` → `MAX_DESCUENTO_PCT`, `ESTADO_VENTA`
- **Booleanos:** prefijo `is`, `has`, `puede` → `isLoading`, `hasDescuento`, `puedeAutorizar`
- **Handlers de eventos en React:** prefijo `handle` → `handleAgregarProducto`, `handleConfirmarCorte`
- **Funciones async que llaman a la API:** sufijo del recurso, verbo claro → `fetchProductos()`, `crearVenta()`, `actualizarStock()`

### 4.3 Base de datos (heredado de schema.sql)

- **Tablas:** `snake_case`, plural → `productos`, `detalle_venta`
- **Columnas:** `snake_case` → `precio_venta`, `stock_actual`
- **Llaves primarias:** `id_<entidad_singular>` → `id_producto`, `id_venta`
- **Llaves foráneas:** mismo nombre que la PK referenciada → `id_producto` en `detalle_venta` apunta a `productos.id_producto`
- **Booleanos:** sin prefijo `is_`, en español directo → `activo`, no `is_active`

### 4.4 API REST (endpoints)

- **Recursos en plural, kebab-case si son compuestos:** `/api/productos`, `/api/corte-caja`
- **Verbos HTTP, no en la URL:** `POST /api/ventas` (no `/api/crear-venta`)
- **Anidación máxima de 1 nivel:** `/api/ventas/:id/detalle` (no anidar más)
- **Query params en camelCase:** `?fechaInicio=2026-06-01&fechaFin=2026-06-30`

```
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id          # desactivar (HU-03), no eliminar físico

POST   /api/ventas
POST   /api/ventas/:id/devolucion
GET    /api/ventas/:id

POST   /api/turnos/apertura
POST   /api/turnos/:id/cierre

POST   /api/corte-caja

GET    /api/inventario/movimientos
POST   /api/inventario/entrada
POST   /api/inventario/ajuste

GET    /api/reportes/ventas?fechaInicio=...&fechaFin=...
GET    /api/reportes/inventario
```

### 4.5 Ramas Git y commits

- **Ramas:** `tipo/hu-XX-descripcion-corta` → `feature/hu-04-registro-venta`, `fix/hu-13-calculo-diferencia`
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) → `feat(ventas): agregar cálculo de cambio en pago efectivo`, `fix(corte-caja): corregir fórmula de efectivo esperado`

---

## 5. Variables de entorno

```
# Backend (.env)
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
NODE_ENV=development

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 6. Orden de implementación sugerido

1. **Backend base:** `app.js`, conexión a Supabase, middlewares de error y autenticación.
2. **Módulo `usuarios` + `auth`:** login con PIN, roles — bloquea todo lo demás.
3. **Módulo `productos`:** CRUD completo (HU-01 a HU-03).
4. **Módulo `turnos`:** apertura de turno (HU-12) — requisito previo a ventas.
5. **Módulo `ventas`:** registro, cobro, descuento, devolución (HU-04 a HU-08).
6. **Módulo `inventario`:** entradas, alertas, ajustes (HU-09 a HU-11) — los triggers de stock ya están en `schema.sql`.
7. **Módulo `corte-caja`:** cierre de turno (HU-13).
8. **Módulo `reportes`:** consultas sobre las vistas `v_stock_status` y `v_resumen_turno`.
9. **Frontend:** en el mismo orden, empezando por `auth` y `ventas` (la pantalla más usada).

---

## 7. Pendiente de definir antes de codear

- Confirmar si offline-first (spec 5.1) sigue siendo requisito duro o se acepta Supabase con conexión permanente para v1.
- Confirmar proveedor de impresión (driver local vs. servicio de impresión en red).
- Definir si Supabase Row Level Security (RLS) se usa para reforzar los roles o si la autorización vive solo en el backend Express.
