# skill-ith-backend.md

## Identidad del proyecto
- Proyecto: Sistema de Punto de Venta – ITH Sistemas y Computación
- Stack: Node.js + Express + Supabase

## Convenciones de código
- Variables y funciones: en español (camelCase) → `calcularTotalVenta`, `stockActual`
- Comentarios: en español
- Archivos: en español, minúsculas, camelCase con punto separador (ej. `productos.routes.js`)
- Carpetas de módulo: `kebab-case` cuando el nombre es compuesto (ej. `corte-caja/`)

## Respuestas de API
- Éxito:  `{ success: true, data: [...] }`
- Error:  `{ success: false, error: "Mensaje descriptivo" }`

## Manejo de errores
- Códigos HTTP estándar: 200, 201, 400, 401, 403, 404, 409, 500
- Siempre usar try/catch (centralizado vía asyncHandler.js)
- Nunca exponer errores internos (stack traces, mensajes de Postgres/Supabase) al cliente

## Base de datos (Supabase)
- Credenciales siempre en `.env`, nunca en el código
- Tablas en español, plural (`productos`, `ventas`, `usuarios`, `corte_caja`)
- Columnas en español, `snake_case` (`precio_venta`, `stock_actual`)
- Llaves primarias: `id_<entidad_singular>` (`id_producto`, `id_venta`)
