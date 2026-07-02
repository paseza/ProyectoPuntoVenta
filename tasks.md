# Tareas de Implementación — Backend POS

**Versión:** 1.0
**Basado en:** spec.md v1.0, plan.md v1.0
**Alcance:** Solo backend (Node.js + Express + Supabase)

Convención: cada tarea tiene un ID `T-XX`, su dependencia explícita, y un criterio de "Hecho" verificable sin ambigüedad (ejecutable, observable o revisable por otra persona).

---

## Bloque 0 — Infraestructura base

### T-01 — Inicializar proyecto backend
**Depende de:** nada
**Hecho cuando:**
- Existe `pos-backend/package.json` con `express`, `dotenv`, `@supabase/supabase-js`, `zod` como dependencias.
- `npm install` corre sin errores.
- `node src/server.js` levanta el proceso sin lanzar excepciones (aunque no haya rutas aún).

---

### T-02 — Configurar variables de entorno y validación
**Depende de:** T-01
**Hecho cuando:**
- Existe `.env.example` con `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `NODE_ENV`.
- `src/config/env.js` lanza un error explícito al iniciar si falta alguna variable obligatoria.
- Arrancar el servidor sin `.env` produce un mensaje de error legible (no un stack trace genérico).

---

### T-03 — Conectar cliente Supabase
**Depende de:** T-02
**Hecho cuando:**
- `src/config/supabase.client.js` exporta un cliente inicializado con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- Un script de prueba (`node -e "..."` o test unitario) hace `SELECT 1` o consulta `categorias` y recibe respuesta sin error de conexión.

---

### T-04 — Ejecutar schema.sql en la instancia Supabase
**Depende de:** T-03
**Hecho cuando:**
- Las 8 tablas (`categorias`, `productos`, `usuarios`, `turnos`, `ventas`, `detalle_venta`, `movimientos_inventario`, `corte_caja`) existen en el proyecto Supabase.
- Las vistas `v_stock_status` y `v_resumen_turno` existen y son consultables.
- `SELECT * FROM categorias` devuelve las 5 categorías semilla del script.

---

### T-05 — Middleware global de manejo de errores
**Depende de:** T-01
**Hecho cuando:**
- `src/middlewares/errorHandler.middleware.js` captura cualquier error lanzado en rutas y responde JSON con `{ error: string }` y código HTTP apropiado (no 500 genérico para errores de validación).
- Un endpoint de prueba que lanza un error intencional responde con JSON estructurado, no con HTML de stack trace.

---

### T-06 — Middleware de validación con Zod
**Depende de:** T-01
**Hecho cuando:**
- `src/middlewares/validate.middleware.js` recibe un schema Zod y rechaza requests inválidos con `400` y detalle de qué campo falló.
- Un test envía un body inválido a un endpoint protegido y recibe `400` con mensaje específico del campo (no genérico).

---

## Bloque 1 — Usuarios y autenticación

### T-07 — Modelo y servicio de usuarios
**Depende de:** T-04
**Hecho cuando:**
- `usuarios.service.js` expone `crearUsuario`, `obtenerUsuarioPorUsuario`, `listarUsuarios`.
- `crearUsuario` guarda el PIN como hash (bcrypt), nunca en texto plano — verificable inspeccionando la fila en la base de datos.

---

### T-08 — Endpoint de login con PIN
**Depende de:** T-07
**Hecho cuando:**
- `POST /api/auth/login` recibe `{ usuario, pin }` y responde `200` con un token (JWT) si las credenciales son correctas.
- El mismo endpoint con PIN incorrecto responde `401` sin revelar si el usuario existe o no.
- El token emitido contiene `id_usuario` y `rol` en el payload (verificable decodificando el JWT).

---

### T-09 — Middleware de autenticación (sesión activa)
**Depende de:** T-08
**Hecho cuando:**
- `src/middlewares/auth.middleware.js` rechaza con `401` cualquier request a una ruta protegida sin token válido.
- Una request con token expirado o corrupto recibe `401`, no `500`.
- Una request con token válido inyecta `req.usuario` con `id_usuario` y `rol`.

---

### T-10 — Middleware de expiración por inactividad (15 min)
**Depende de:** T-09
**Hecho cuando:**
- El token o la sesión almacena timestamp de última actividad.
- Una request realizada 16 minutos después de la última actividad registrada es rechazada con `401` y mensaje "Sesión expirada por inactividad".
- Cumple restricción técnica 5.3 del spec.

---

### T-11 — Middleware de autorización por rol
**Depende de:** T-09
**Hecho cuando:**
- `requireRole.middleware.js` acepta una lista de roles permitidos (`['supervisor', 'admin']`) y rechaza con `403` a usuarios con rol distinto.
- Un cajero que intenta acceder a una ruta marcada `requireRole(['supervisor'])` recibe `403`, no `401`.

---

### T-12 — Endpoint de re-autorización con PIN de supervisor
**Depende de:** T-09
**Hecho cuando:**
- `POST /api/auth/autorizar-supervisor` recibe `{ usuario, pin }` y responde `200` con confirmación si el usuario tiene rol `supervisor` o `admin`.
- Responde `403` si el PIN es válido pero el rol no es de supervisor.
- Esta autorización es la que usarán T-22 (descuentos) y T-25 (devoluciones).

---

## Bloque 2 — Catálogo de productos

### T-13 — CRUD de categorías
**Depende de:** T-04
**Hecho cuando:**
- `GET /api/categorias` devuelve lista.
- `POST /api/categorias` crea una nueva con `nombre` único (rechaza duplicados con `409`).

---

### T-14 — Crear producto (HU-01)
**Depende de:** T-06, T-09
**Hecho cuando:**
- `POST /api/productos` con `{ nombre, codigo_barras, precio_venta, id_categoria, unidad_medida }` crea el producto y responde `201` con el registro.
- Repetir el mismo `codigo_barras` responde `409` con mensaje "Este código ya existe" — cumple criterio de aceptación de HU-01.
- `precio_venta <= 0` es rechazado con `400` antes de tocar la base de datos.

---

### T-15 — Buscar producto por código de barras o nombre
**Depende de:** T-14
**Hecho cuando:**
- `GET /api/productos?codigo=XXXX` devuelve exactamente un producto si existe, o `404` si no.
- `GET /api/productos?buscar=texto` devuelve coincidencias parciales por nombre (case-insensitive).
- Solo devuelve productos con `activo = 1` (cumple HU-03).

---

### T-16 — Editar producto / actualizar precio (HU-02)
**Depende de:** T-14
**Hecho cuando:**
- `PUT /api/productos/:id` actualiza el precio sin modificar registros existentes en `detalle_venta`.
- Verificación: crear una venta con precio A, luego cambiar el precio del producto a B, y confirmar que `detalle_venta.precio_unitario` de la venta anterior sigue siendo A.

---

### T-17 — Desactivar / reactivar producto (HU-03)
**Depende de:** T-14
**Hecho cuando:**
- `DELETE /api/productos/:id` cambia `activo` a `0`, no elimina la fila.
- El producto desactivado deja de aparecer en `GET /api/productos?buscar=...` (T-15).
- `PUT /api/productos/:id/reactivar` regresa `activo` a `1` y el producto vuelve a aparecer en búsquedas.

---

## Bloque 3 — Turnos

### T-18 — Apertura de turno (HU-12)
**Depende de:** T-09
**Hecho cuando:**
- `POST /api/turnos/apertura` con `{ fondo_inicial }` crea un turno con `estado = 'abierto'` y responde `201`.
- Un segundo intento de apertura mientras hay un turno abierto responde `409` (el índice único parcial de `schema.sql` lo refuerza a nivel DB).
- `fondo_inicial < 0` es rechazado con `400`.

---

### T-19 — Consultar turno activo
**Depende de:** T-18
**Hecho cuando:**
- `GET /api/turnos/activo` devuelve el turno con `estado = 'abierto'` si existe, o `404` con mensaje claro si no hay ninguno.
- Esta ruta es la que usará el frontend para bloquear/permitir la pantalla de ventas (HU-13, escenario 4).

---

## Bloque 4 — Ventas

### T-20 — Crear venta con folio consecutivo (HU-04)
**Depende de:** T-19, T-15
**Hecho cuando:**
- `POST /api/ventas` requiere un turno activo; si no existe, responde `409` "No hay turno activo".
- Cada venta creada recibe un `folio` único autoincremental con formato `V-000001`.
- `src/lib/folioGenerator.js` genera el folio sin colisiones bajo 10 inserciones concurrentes (test de concurrencia básico).

---

### T-21 — Agregar/quitar productos del detalle de venta
**Depende de:** T-20
**Hecho cuando:**
- `POST /api/ventas/:id/detalle` agrega un ítem con `precio_unitario` tomado del catálogo en ese momento (no recalculado después).
- `subtotal` del ítem se calcula como `cantidad * precio_unitario` y coincide con el trigger de `schema.sql` (`trg_detalle_subtotal`).
- `DELETE /api/ventas/:id/detalle/:idDetalle` elimina el ítem y el total de la venta se recalcula — verificable comparando el total antes/después.

---

### T-22 — Aplicar descuento con autorización de supervisor (HU-06)
**Depende de:** T-12, T-21
**Hecho cuando:**
- `POST /api/ventas/:id/descuento` exige `{ valor, tipo, supervisorUsuario, supervisorPin }`.
- Si el PIN de supervisor es inválido, responde `403` sin aplicar el descuento.
- Si `descuento_pct > 30` (límite configurado), responde `400` "Descuento fuera del límite permitido" — cumple criterio de HU-06.
- El descuento aplicado se refleja en `ventas.id_supervisor_desc`.

---

### T-23 — Cobrar y cerrar venta (HU-07)
**Depende de:** T-21
**Hecho cuando:**
- `POST /api/ventas/:id/cobrar` con `{ pago_efectivo, pago_tarjeta }` cierra la venta solo si `pago_efectivo + pago_tarjeta >= total` (refuerza `trg_ventas_pago_check`).
- Pago insuficiente responde `400` antes de tocar la base de datos.
- Pago en efectivo mayor al total calcula `cambio` correctamente — verificable con caso `total=100, pago_efectivo=150 → cambio=50`.
- Al cerrar la venta, se generan automáticamente los registros en `movimientos_inventario` (tipo `salida`) por cada producto vendido, y el `stock_actual` de cada producto disminuye en la cantidad correspondiente.

---

### T-24 — Consultar venta por folio
**Depende de:** T-20
**Hecho cuando:**
- `GET /api/ventas/:folio` devuelve la venta con su detalle completo (productos, cantidades, totales, método de pago).
- Folio inexistente responde `404`.

---

### T-25 — Procesar devolución (HU-08)
**Depende de:** T-24, T-12
**Hecho cuando:**
- `POST /api/ventas/:folio/devolucion` exige autorización de supervisor (mismo mecanismo que T-22).
- Acepta devolución total o parcial (lista de `id_detalle` a devolver).
- Crea una nueva fila en `ventas` con `id_venta_origen` apuntando al folio original.
- Genera movimientos de inventario tipo `devolucion` que **incrementan** el stock — verificable comparando `stock_actual` antes/después.
- El monto devuelto se registra como egreso recuperable en el cálculo del corte de caja (usado por T-29).

---

## Bloque 5 — Inventario

### T-26 — Registrar entrada de mercancía (HU-09)
**Depende de:** T-14
**Hecho cuando:**
- `POST /api/inventario/entrada` con `{ id_producto, cantidad, costo_unitario }` incrementa `stock_actual` y crea un registro en `movimientos_inventario` con `tipo='entrada'`.
- `cantidad <= 0` es rechazado con `400`.
- `stock_anterior` y `stock_nuevo` del movimiento creado son consistentes con el valor real de `productos.stock_actual` antes y después.

---

### T-27 — Ajuste manual de inventario (HU-11)
**Depende de:** T-14
**Hecho cuando:**
- `POST /api/inventario/ajuste` con `{ id_producto, cantidad_final, motivo }` crea un movimiento `tipo='ajuste'` con la diferencia correcta (`cantidad_final - stock_actual`).
- `motivo` es obligatorio — un request sin motivo responde `400`.

---

### T-28 — Alerta de stock mínimo (HU-10)
**Depende de:** T-04
**Hecho cuando:**
- `GET /api/inventario/alertas` devuelve todos los productos donde `stock_actual <= stock_minimo` (usando la vista `v_stock_status`, filtrando `estatus != 'OK'`).
- Crear una venta que reduzca el stock de un producto por debajo de su mínimo hace que ese producto aparezca en esta consulta inmediatamente después (sin caché obsoleta).

---

## Bloque 6 — Corte de caja

### T-29 — Generar corte de caja (HU-13)
**Depende de:** T-19, T-23, T-25, T-12
**Hecho cuando:**
- `POST /api/corte-caja` exige PIN de supervisor y `{ efectivo_contado }`.
- Calcula `efectivo_esperado = fondo_inicial + ventas_efectivo - devoluciones_efectivo` automáticamente desde la base de datos (no recibido del cliente).
- `diferencia = efectivo_contado - efectivo_esperado`, positiva o negativa según corresponda — verificable con los 3 casos del spec: exacto ($0.00), faltante (-$50.00), sobrante (+$50.00).
- Al crear el corte, el turno asociado cambia a `estado='cerrado'` (verifica el trigger `trg_corte_cierra_turno`).
- Tras el corte, `POST /api/ventas` con ese turno responde `409` "No hay turno activo" (cumple escenario 4 de HU-13).

---

### T-30 — Consultar historial de cortes de caja
**Depende de:** T-29
**Hecho cuando:**
- `GET /api/corte-caja?fechaInicio=...&fechaFin=...` devuelve los cortes en ese rango con todos sus campos (fondo, ventas, diferencia, supervisor).
- Sin parámetros de fecha, devuelve los últimos 30 cortes ordenados por fecha descendente.

---

## Bloque 7 — Reportes

### T-31 — Reporte de ventas por rango de fechas (HU-14)
**Depende de:** T-23
**Hecho cuando:**
- `GET /api/reportes/ventas?fechaInicio=...&fechaFin=...` devuelve: total de transacciones, monto total, desglose por método de pago, top 5 productos más vendidos.
- Rango de fechas inválido (`fechaInicio > fechaFin`) responde `400`.

---

### T-32 — Reporte de inventario actual (HU-15)
**Depende de:** T-28
**Hecho cuando:**
- `GET /api/reportes/inventario` devuelve todos los productos activos con `stock_actual`, `stock_minimo` y `estatus` (OK/Bajo/Agotado), usando la vista `v_stock_status`.
- Los productos con `estatus != 'OK'` aparecen marcados de forma identificable en la respuesta JSON (campo `estatus` explícito, no inferido por el cliente).

---

## Bloque 8 — Calidad y cierre

### T-33 — Suite de tests de integración por módulo
**Depende de:** T-14 a T-32
**Hecho cuando:**
- Existe al menos un test de integración por endpoint crítico (`ventas`, `corte-caja`, `inventario`).
- `npm test` corre toda la suite y termina en verde sin intervención manual.
- Cobertura mínima: los 5 escenarios reformulados de HU-13 están cada uno representado por un test explícito.

---

### T-34 — Documentación de endpoints (README o OpenAPI)
**Depende de:** T-14 a T-32
**Hecho cuando:**
- Existe `pos-backend/README.md` o `openapi.yaml` listando cada endpoint con método, body esperado, respuestas posibles y código de estado.
- Cualquier persona ajena al proyecto puede levantar el servidor y hacer una venta de prueba siguiendo solo la documentación, sin leer el código fuente.

---

## Resumen de dependencias (orden de ejecución)

```
T-01 → T-02 → T-03 → T-04
                 ↓
        T-05, T-06 (paralelo a T-04)
                 ↓
    T-07 → T-08 → T-09 → T-10, T-11, T-12
                 ↓
        T-13 → T-14 → T-15 → T-16, T-17
                 ↓
              T-18 → T-19
                 ↓
T-20 → T-21 → T-22, T-23 → T-24 → T-25
                 ↓
        T-26, T-27 → T-28
                 ↓
              T-29 → T-30
                 ↓
        T-31, T-32
                 ↓
           T-33 → T-34
```

**Total: 34 tareas atómicas.**
