# pos-frontend

Frontend del Sistema de Punto de Venta (ITH Sistemas y Computación). React 18 + Vite + Tailwind CSS + TanStack Query.

## Requisitos

- Node.js 18+
- El backend (`pos-backend`) corriendo en `http://localhost:4000`

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base del backend, incluye `/api` | `http://localhost:4000/api` |

## Módulos implementados

- **Autenticación**: login con usuario + PIN, sesión persistida en `localStorage`, rutas protegidas por rol, modal de re-autorización de supervisor.
- **Catálogo de productos**: listado con búsqueda, alta, edición y desactivación/reactivación.
- **Terminal de ventas (carrito)**: apertura de turno, búsqueda/escaneo de producto, carrito con edición de cantidades, cobro con efectivo/tarjeta y ticket imprimible.
- **Corte de caja**: resumen del turno activo, cálculo de diferencia en tiempo real, cierre de turno con autorización de supervisor e historial de cortes.
- **Manejo de errores**: cliente HTTP centralizado con normalización de errores, toasts globales de éxito/error y `ErrorBoundary` de React.

## Usuarios de prueba

Los usuarios se crean directamente en el backend (`POST /api/usuarios`, requiere rol admin) o en Supabase. No hay usuarios sembrados por defecto en este frontend.
