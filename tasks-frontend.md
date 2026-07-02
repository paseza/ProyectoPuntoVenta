# Tareas de Implementación — Frontend POS

**Versión:** 1.0
**Basado en:** spec.md v1.0, plan.md v1.0, skill-ith-backend.md
**Stack:** React 18 + Vite + Tailwind CSS + TanStack Query
**Alcance:** Solo frontend

Convención: cada tarea tiene un ID `TF-XX`, su dependencia, el archivo(s) que produce y un criterio de "Hecho" verificable en formato Given/When/Then observable en el navegador.

---

## Bloque 0 — Infraestructura y base del proyecto

### TF-01 — Inicializar proyecto Vite + React + Tailwind
**Depende de:** nada
**Archivos:** `vite.config.js`, `tailwind.config.js`, `src/main.jsx`, `src/App.jsx`
**Hecho cuando:**
```
Given que se ejecuta `npm run dev` en pos-frontend/
When el navegador abre http://localhost:5173
Then se muestra una pantalla en blanco sin errores en consola
And Tailwind funciona: una clase como `bg-blue-500` aplicada a un div cambia su color
```

---

### TF-02 — Configurar cliente API (apiClient.js)
**Depende de:** TF-01
**Archivos:** `src/lib/apiClient.js`
**Hecho cuando:**
```
Given que VITE_API_BASE_URL está definida en .env
When cualquier módulo importa apiClient y llama a apiClient.get('/health')
Then la petición se dirige a http://localhost:4000/api/health sin repetir la URL base en cada llamada
And si el servidor responde 401, apiClient redirige automáticamente al login
```

---

### TF-03 — Configurar React Query
**Depende de:** TF-01
**Archivos:** `src/lib/queryClient.js`, `src/main.jsx`
**Hecho cuando:**
```
Given que la aplicación está montada
When se abre React Query Devtools (ícono en esquina inferior)
Then aparece el panel de TanStack Query sin errores
And el QueryClient tiene configurado staleTime de 30 segundos como mínimo
```

---

### TF-04 — Contexto de sesión (SessionContext)
**Depende de:** TF-02
**Archivos:** `src/context/SessionContext.jsx`, `src/hooks/useSession.js`
**Hecho cuando:**
```
Given que no hay token en localStorage
When cualquier componente llama a useSession()
Then obtiene { usuario: null, token: null, isAutenticado: false }
```
```
Given que hay un token válido en localStorage
When la aplicación se recarga
Then useSession() devuelve el usuario y rol del token sin pedir login de nuevo
```

---

### TF-05 — Router y rutas protegidas (AppRouter)
**Depende de:** TF-04
**Archivos:** `src/router/AppRouter.jsx`
**Hecho cuando:**
```
Given que el usuario no está autenticado
When intenta navegar manualmente a /ventas o cualquier ruta protegida
Then el navegador lo redirige automáticamente a /login
```
```
Given que el usuario está autenticado con rol "cajero"
When intenta navegar a /reportes (ruta solo de admin/supervisor)
Then ve una pantalla "Acceso no permitido" en lugar del contenido
```

---

### TF-06 — Layout principal (AppLayout, Sidebar, Topbar)
**Depende de:** TF-05
**Archivos:** `src/components/layout/AppLayout.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/layout/Topbar.jsx`
**Hecho cuando:**
```
Given que el usuario está autenticado
When navega a cualquier ruta protegida
Then ve un sidebar izquierdo con los módulos disponibles según su rol
And un topbar superior con su nombre, rol y botón de cerrar sesión
And el contenido principal ocupa el espacio restante sin desbordamiento
```
```
Given que el usuario tiene rol "cajero"
When observa el sidebar
Then NO ve las opciones de Reportes ni Usuarios (restringidas a admin/supervisor)
```

---

### TF-07 — Componentes UI base
**Depende de:** TF-01
**Archivos:** `src/components/ui/Button.jsx`, `src/components/ui/Input.jsx`, `src/components/ui/Modal.jsx`, `src/components/ui/Badge.jsx`, `src/components/ui/DataTable.jsx`
**Hecho cuando:**
```
Given que se renderiza cada componente en aislamiento
When se inspecciona visualmente
Then Button muestra variantes: primario (azul), secundario (gris), peligro (rojo) y estado deshabilitado
And Input muestra estado normal, error (borde rojo + mensaje) y deshabilitado
And Modal bloquea el scroll del fondo y tiene botón de cierre visible
And Badge muestra colores distintos para OK (verde), Bajo (amarillo) y Agotado (rojo)
And DataTable renderiza encabezados, filas y un mensaje "Sin resultados" cuando data=[]
```

---

## Bloque 1 — Autenticación

### TF-08 — Pantalla de login con PinPad (LoginPage, PinPad)
**Depende de:** TF-04, TF-07
**Archivos:** `src/features/auth/LoginPage.jsx`, `src/features/auth/components/PinPad.jsx`, `src/features/auth/hooks/useAuth.js`
**Hecho cuando:**
```
Given que el usuario está en /login
When escribe su usuario y PIN correcto (mínimo 4 dígitos) y confirma
Then es redirigido a /ventas si es cajero, o al dashboard si es admin/supervisor
And su nombre y rol aparecen en el Topbar
```
```
Given que el usuario ingresa un PIN incorrecto
When confirma el login
Then ve el mensaje "Usuario o PIN incorrectos" en rojo debajo del formulario
And el campo de PIN se limpia automáticamente para reintentar
```
```
Given que el usuario ingresa solo 3 dígitos en el PIN
When intenta confirmar
Then el botón de confirmación permanece deshabilitado (validación en cliente)
```

---

### TF-09 — Cierre de sesión
**Depende de:** TF-06, TF-08
**Archivos:** `src/features/auth/hooks/useAuth.js` (función cerrarSesion)
**Hecho cuando:**
```
Given que el usuario está autenticado y hace clic en "Cerrar sesión" del Topbar
When confirma la acción en el modal de confirmación
Then el token se elimina, el contexto se limpia y es redirigido a /login
And si presiona "Atrás" en el navegador, no puede volver a la pantalla anterior
```

---

### TF-10 — Modal de re-autorización de supervisor (PinPad reutilizable)
**Depende de:** TF-07, TF-08
**Archivos:** `src/features/auth/components/PinPad.jsx` (modo modal)
**Hecho cuando:**
```
Given que una acción requiere autorización de supervisor (descuento, devolución, corte)
When el sistema muestra el modal "Se requiere autorización de supervisor"
Then el cajero puede ingresar usuario + PIN de supervisor sin cerrar su propia sesión
And si el PIN es incorrecto, el modal muestra "PIN de supervisor inválido" y permanece abierto
And si es correcto, el modal se cierra y la acción continúa
```

---

## Bloque 2 — Productos y Catálogo

### TF-11 — Página de productos con tabla y búsqueda (ProductosPage, ProductoTable)
**Depende de:** TF-06, TF-07
**Archivos:** `src/features/productos/ProductosPage.jsx`, `src/features/productos/components/ProductoTable.jsx`, `src/features/productos/hooks/useProductos.js`, `src/features/productos/api/productos.api.js`
**Hecho cuando:**
```
Given que el admin navega a /productos
When la página carga
Then ve una tabla con columnas: Código, Nombre, Categoría, Precio, Stock, Estatus, Acciones
And los productos con activo=false aparecen con fila atenuada y badge "Inactivo"
And hay un campo de búsqueda que filtra en tiempo real por nombre o código de barras
```
```
Given que el admin escribe en el campo de búsqueda
When ha escrito al menos 2 caracteres
Then la tabla se actualiza en menos de 500 ms sin recargar la página (HU-04, spec 5.2)
```

---

### TF-12 — Formulario de alta de producto (ProductoForm)
**Depende de:** TF-11
**Archivos:** `src/features/productos/components/ProductoForm.jsx`
**Hecho cuando:**
```
Given que el admin hace clic en "Nuevo producto"
When se abre el formulario modal
Then ve campos: Nombre*, Código de barras*, Categoría, Precio de venta*, Costo, Unidad de medida, Stock mínimo
And los campos marcados con * muestran error visual si se deja vacío y se intenta guardar
```
```
Given que el admin ingresa un código de barras ya existente y guarda
When el backend responde 409
Then el formulario muestra el mensaje "Este código ya existe" debajo del campo (HU-01)
And el formulario permanece abierto con los datos intactos
```
```
Given que el admin completa el formulario correctamente y guarda
When el backend responde 201
Then el modal se cierra, la tabla se actualiza automáticamente y aparece un toast "Producto creado"
```

---

### TF-13 — Edición de precio y datos de producto (HU-02)
**Depende de:** TF-12
**Archivos:** `src/features/productos/components/ProductoForm.jsx` (modo edición)
**Hecho cuando:**
```
Given que el admin hace clic en "Editar" en un producto de la tabla
When se abre el formulario con los datos precargados
Then puede modificar el precio de venta u otros campos
And al guardar, la tabla refleja el nuevo precio inmediatamente
And las ventas anteriores registradas con el precio viejo no cambian (verificable en historial)
```

---

### TF-14 — Desactivar y reactivar producto (HU-03)
**Depende de:** TF-11
**Archivos:** `src/features/productos/ProductosPage.jsx`
**Hecho cuando:**
```
Given que el admin hace clic en "Desactivar" en un producto activo
When confirma en el modal de confirmación
Then el producto aparece con badge "Inactivo" y fila atenuada en la tabla
And desaparece de los resultados de búsqueda en la terminal de ventas
```
```
Given que el admin hace clic en "Reactivar" en un producto inactivo
When confirma la acción
Then el producto vuelve a aparecer con badge "Activo" en la tabla
```

---

## Bloque 3 — Terminal de Ventas (POS)

### TF-15 — Página principal de ventas con buscador (VentasPage, BuscadorProducto)
**Depende de:** TF-06, TF-07, TF-10
**Archivos:** `src/features/ventas/VentasPage.jsx`, `src/features/ventas/components/BuscadorProducto.jsx`, `src/features/ventas/hooks/useVentaActiva.js`, `src/features/ventas/api/ventas.api.js`
**Hecho cuando:**
```
Given que el cajero navega a /ventas con un turno activo
When la página carga
Then ve: campo de búsqueda/escaneo en la parte superior, carrito vacío a la derecha y total en $0.00
And el foco del cursor está automáticamente en el campo de búsqueda (listo para escanear)
```
```
Given que no hay turno activo
When el cajero navega a /ventas
Then ve el banner "No hay turno activo. Abre un turno para comenzar a vender."
And todos los controles de venta están deshabilitados
```

---

### TF-16 — Buscar y agregar producto al carrito (HU-04, spec 5.2)
**Depende de:** TF-15
**Archivos:** `src/features/ventas/components/BuscadorProducto.jsx`, `src/features/ventas/components/CarritoVenta.jsx`
**Hecho cuando:**
```
Given que el cajero escribe un código de barras o nombre en el buscador
When el producto es encontrado
Then aparece en el carrito con cantidad 1 y su precio unitario en menos de 300 ms (spec 5.2)
And el total de la venta se actualiza en tiempo real
```
```
Given que el cajero escanea un código no registrado
When el sistema no encuentra el producto
Then muestra el aviso "Producto no encontrado" bajo el buscador y el campo se limpia (HU-04)
And no se agrega nada al carrito
```
```
Given que el cajero agrega el mismo producto dos veces
When el producto ya está en el carrito
Then la cantidad incrementa a 2 en lugar de duplicar el ítem
```

---

### TF-17 — Modificar cantidad y eliminar ítem del carrito (HU-05)
**Depende de:** TF-16
**Archivos:** `src/features/ventas/components/CarritoVenta.jsx`
**Hecho cuando:**
```
Given que hay productos en el carrito
When el cajero cambia la cantidad de un ítem a un número mayor que cero
Then el subtotal de ese ítem y el total general se recalculan visualmente en tiempo real (HU-05)
```
```
Given que el cajero hace clic en el ícono de eliminar de un ítem
When confirma la acción (o si no hay confirmación, al instante)
Then el ítem desaparece del carrito y el total se actualiza (HU-05)
```
```
Given que el cajero intenta ingresar cantidad 0 o negativa
When el campo pierde el foco
Then la cantidad vuelve al valor anterior (no se permite cantidad 0)
```

---

### TF-18 — Panel de cobro y métodos de pago (HU-07)
**Depende de:** TF-17
**Archivos:** `src/features/ventas/components/PanelCobro.jsx`
**Hecho cuando:**
```
Given que hay productos en el carrito y el cajero hace clic en "Cobrar"
When se abre el panel de cobro
Then ve el total a pagar, campos para efectivo y tarjeta, y el cambio calculado en tiempo real
```
```
Given que el cajero ingresa $150 en efectivo para una venta de $100
When el monto se actualiza en el campo
Then el campo "Cambio" muestra $50.00 automáticamente sin hacer clic en nada (HU-07)
```
```
Given que la suma de efectivo + tarjeta es menor al total
When el cajero intenta confirmar el cobro
Then el botón "Confirmar cobro" permanece deshabilitado y aparece el mensaje "Pago insuficiente"
```
```
Given que el pago cubre el total y el cajero confirma
When el backend responde exitosamente
Then el carrito se vacía, aparece el ticket en pantalla y un toast "Venta registrada — Folio V-XXXXXX"
```

---

### TF-19 — Vista previa e impresión de ticket (TicketPreview)
**Depende de:** TF-18
**Archivos:** `src/features/ventas/components/TicketPreview.jsx`
**Hecho cuando:**
```
Given que una venta se cerró exitosamente
When aparece el ticket en pantalla
Then el ticket muestra: nombre del negocio, folio, fecha/hora, lista de productos con cantidades
  y precios, subtotal, descuento (si aplica), total, método de pago, cambio y leyenda (spec 5.4)
```
```
Given que el cajero hace clic en "Imprimir ticket"
When el navegador abre el diálogo de impresión
Then el ticket se muestra con ancho de 80mm sin elementos de interfaz (sidebar, topbar)
```

---

### TF-20 — Aplicar descuento con autorización de supervisor (HU-06)
**Depende de:** TF-10, TF-17
**Archivos:** `src/features/ventas/VentasPage.jsx`, `src/features/ventas/components/CarritoVenta.jsx`
**Hecho cuando:**
```
Given que hay productos en el carrito y el cajero hace clic en "Aplicar descuento"
When se abre el modal de descuento
Then puede seleccionar tipo (porcentaje o monto fijo) e ingresar el valor
And debe ingresar usuario + PIN de supervisor para confirmar (reutiliza TF-10)
```
```
Given que el supervisor ingresa un descuento del 35% (supera el límite del 30%)
When intenta confirmar
Then el sistema muestra "Descuento fuera del límite permitido" sin aplicarlo (HU-06)
```
```
Given que el descuento es válido y el supervisor lo autoriza
When se aplica
Then el total en el carrito se actualiza con el descuento visible como línea separada
And el nombre del supervisor aparece en la línea del descuento
```

---

### TF-21 — Procesar devolución (HU-08)
**Depende de:** TF-10, TF-15
**Archivos:** `src/features/ventas/VentasPage.jsx` (botón "Devolución"), modal de devolución
**Hecho cuando:**
```
Given que el supervisor hace clic en "Devolución" e ingresa un folio de venta
When el sistema encuentra la venta
Then muestra la lista de ítems de esa venta con checkboxes para seleccionar cuáles devolver
```
```
Given que el supervisor selecciona ítems y confirma con su PIN
When el backend procesa la devolución
Then aparece un toast "Devolución registrada — Folio V-XXXXXX"
And el inventario de los productos devueltos se actualiza automáticamente (HU-08)
```
```
Given que el folio ingresado no existe
When el sistema lo busca
Then muestra "Folio no encontrado" bajo el campo y no avanza
```

---

## Bloque 4 — Turnos

### TF-22 — Pantalla de apertura de turno (HU-12)
**Depende de:** TF-06, TF-07
**Archivos:** `src/features/ventas/VentasPage.jsx` (banner de turno inactivo), modal de apertura
**Hecho cuando:**
```
Given que no hay turno activo y el cajero está en /ventas
When hace clic en "Abrir turno"
Then se abre un modal con un campo numérico "Fondo inicial de caja"
And el campo no acepta valores negativos
```
```
Given que el cajero ingresa el fondo inicial y confirma
When el backend responde 201
Then el modal se cierra, el banner desaparece y la terminal de ventas queda habilitada (HU-12)
And el Topbar muestra el horario de inicio del turno actual
```
```
Given que ya hay un turno abierto
When otro usuario intenta abrir uno nuevo
Then el sistema muestra "Ya existe un turno activo" y no permite abrir otro
```

---

## Bloque 5 — Inventario

### TF-23 — Página de inventario con alertas de stock (InventarioPage, AlertaStock)
**Depende de:** TF-06, TF-07
**Archivos:** `src/features/inventario/InventarioPage.jsx`, `src/features/inventario/components/AlertaStock.jsx`, `src/features/inventario/hooks/useInventario.js`, `src/features/inventario/api/inventario.api.js`
**Hecho cuando:**
```
Given que el admin navega a /inventario
When la página carga
Then ve una tabla con: Nombre, Código, Stock actual, Stock mínimo, Estatus
And los productos con estatus "Agotado" muestran badge rojo, "Bajo" en amarillo, "OK" en verde (HU-10, HU-15)
And hay un panel o sección superior con el conteo de productos en estado Bajo/Agotado
```

---

### TF-24 — Formulario de entrada de mercancía (HU-09)
**Depende de:** TF-23
**Archivos:** `src/features/inventario/components/MovimientoForm.jsx` (modo entrada)
**Hecho cuando:**
```
Given que el admin hace clic en "Registrar entrada"
When se abre el formulario
Then puede buscar el producto (por nombre o código), ingresar cantidad y costo unitario
And cantidad debe ser mayor a 0 (validación en cliente antes de enviar)
```
```
Given que el admin completa el formulario y confirma
When el backend responde 201
Then el stock del producto en la tabla se actualiza inmediatamente sin recargar la página (HU-09)
And aparece un toast "Entrada registrada correctamente"
```

---

### TF-25 — Formulario de ajuste de inventario (HU-11)
**Depende de:** TF-23
**Archivos:** `src/features/inventario/components/MovimientoForm.jsx` (modo ajuste)
**Hecho cuando:**
```
Given que el admin hace clic en "Ajuste de inventario" en un producto
When se abre el formulario
Then ve el stock actual del producto y un campo "Cantidad final real" y "Motivo" (obligatorio)
```
```
Given que el admin deja el campo "Motivo" vacío e intenta guardar
When el formulario valida
Then muestra "El motivo del ajuste es obligatorio" y no envía la petición (HU-11)
```
```
Given que el admin completa el ajuste correctamente
When el backend responde 201
Then el stock en la tabla refleja la cantidad final ingresada
And si el nuevo stock queda por debajo del mínimo, el badge cambia a "Bajo" o "Agotado" en tiempo real
```

---

## Bloque 6 — Corte de Caja

### TF-26 — Página de corte de caja (CorteCajaPage, ResumenTurno, FormularioCorte)
**Depende de:** TF-10, TF-22
**Archivos:** `src/features/corte-caja/CorteCajaPage.jsx`, `src/features/corte-caja/components/ResumenTurno.jsx`, `src/features/corte-caja/components/FormularioCorte.jsx`, `src/features/corte-caja/hooks/useCorteCaja.js`, `src/features/corte-caja/api/corteCaja.api.js`
**Hecho cuando:**
```
Given que el supervisor navega a /corte-caja con un turno activo
When la página carga
Then ve el resumen del turno actual: fondo inicial, ventas en efectivo, ventas con tarjeta,
  devoluciones y el efectivo esperado calculado automáticamente
And hay un campo "Efectivo contado físicamente" para ingresar el monto real
```

---

### TF-27 — Calcular diferencia y cerrar turno (HU-13)
**Depende de:** TF-26
**Archivos:** `src/features/corte-caja/components/FormularioCorte.jsx`
**Hecho cuando:**
```
Given que el supervisor ingresa el efectivo contado
When el monto se actualiza en el campo
Then el campo "Diferencia" se calcula en tiempo real: contado - esperado
And si la diferencia es negativa (faltante), aparece en rojo con el símbolo "-"
And si es positiva (sobrante), aparece en verde con el símbolo "+"
And si es cero, aparece en gris con "$0.00" (HU-13 escenarios 1, 2 y 3)
```
```
Given que el supervisor ingresa su PIN y confirma el corte
When el backend responde 201
Then la pantalla muestra el resumen final del corte con todos los campos
And aparece el botón "Imprimir corte" (imprime el resumen como documento)
And la terminal bloquea nuevas ventas hasta abrir un nuevo turno (HU-13 escenario 4)
```

---

### TF-28 — Historial de cortes anteriores
**Depende de:** TF-26
**Archivos:** `src/features/corte-caja/CorteCajaPage.jsx` (sección historial)
**Hecho cuando:**
```
Given que el supervisor navega a /corte-caja
When hace clic en la pestaña "Historial"
Then ve una tabla con los últimos 30 cortes: fecha, supervisor, ventas totales, diferencia
And puede filtrar por rango de fechas con dos campos de tipo date
And la diferencia de cada corte muestra color rojo (faltante) o verde (sobrante)
```

---

## Bloque 7 — Reportes

### TF-29 — Reporte de ventas por período (HU-14)
**Depende de:** TF-06, TF-07
**Archivos:** `src/features/reportes/ReportesPage.jsx`, `src/features/reportes/components/GraficoVentas.jsx`, `src/features/reportes/api/reportes.api.js`
**Hecho cuando:**
```
Given que el admin/supervisor navega a /reportes y selecciona un rango de fechas
When hace clic en "Generar reporte"
Then ve: total de transacciones, monto total, desglose efectivo vs tarjeta
And una tabla o gráfico con el top 5 productos más vendidos del período (HU-14)
```
```
Given que el admin selecciona fechaInicio posterior a fechaFin
When intenta generar el reporte
Then ve el error "La fecha de inicio no puede ser posterior a la fecha de fin" sin hacer la petición
```
```
Given que el reporte está generado
When el admin hace clic en "Imprimir" o "Exportar PDF"
Then el navegador abre el diálogo de impresión con el reporte formateado sin sidebar ni topbar
```

---

### TF-30 — Reporte de inventario actual (HU-15)
**Depende de:** TF-29
**Archivos:** `src/features/reportes/ReportesPage.jsx` (pestaña inventario)
**Hecho cuando:**
```
Given que el admin navega a la pestaña "Inventario" de reportes
When la página carga
Then ve todos los productos activos con: nombre, stock actual, stock mínimo y estatus
And los productos con estatus Bajo o Agotado aparecen al inicio de la lista (ordenados por criticidad)
And hay un contador en el encabezado: "X productos requieren atención" (HU-15)
```

---

## Bloque 8 — Utilidades y cierre

### TF-31 — Utilidades de formato (formatCurrency, formatDate)
**Depende de:** TF-01
**Archivos:** `src/utils/formatCurrency.js`, `src/utils/formatDate.js`
**Hecho cuando:**
```
Given que se llama formatCurrency(1234.5)
When se usa en cualquier componente
Then muestra "$1,234.50" consistentemente en toda la aplicación (mismo formato en carrito, ticket y reportes)
```
```
Given que se llama formatDate('2026-06-30T17:00:00Z')
When se usa en historial de ventas o cortes
Then muestra "30/06/2026 12:00" en formato local (no UTC crudo)
```

---

### TF-32 — Sistema de notificaciones (toasts)
**Depende de:** TF-01
**Archivos:** integrado vía librería (react-hot-toast o similar) en `src/main.jsx`
**Hecho cuando:**
```
Given que cualquier operación exitosa termina (crear producto, cerrar venta, registrar entrada)
When la respuesta del backend es 2xx
Then aparece un toast verde en la esquina superior derecha con el mensaje de éxito
And desaparece automáticamente después de 3 segundos
```
```
Given que cualquier operación falla (error de red, 400, 409, 500)
When el apiClient recibe el error
Then aparece un toast rojo con el mensaje de error del backend (campo error de la respuesta)
And el toast permanece hasta que el usuario lo cierre manualmente
```

---

### TF-33 — Compatibilidad con resolución mínima y pantalla táctil (spec 5.6)
**Depende de:** TF-06 a TF-30
**Hecho cuando:**
```
Given que el navegador se redimensiona a 1024 × 768 px (resolución mínima del spec)
When se navega por todos los módulos
Then ningún elemento queda cortado, solapado o inutilizable
And todos los botones tienen altura mínima de 44px (área táctil usable con dedo)
```

---

## Resumen de dependencias (orden de ejecución)

```
TF-01 → TF-02 → TF-03 → TF-04 → TF-05 → TF-06
                                         ↓
                                    TF-07 (paralelo)
                                         ↓
                    TF-08 → TF-09 → TF-10
                                         ↓
              TF-11 → TF-12 → TF-13 → TF-14   (Productos)
                                         ↓
              TF-15 → TF-16 → TF-17 → TF-18 → TF-19   (Ventas)
                          ↓              ↓
                       TF-20          TF-21              (Descuento / Devolución)
                                         ↓
                                      TF-22              (Turnos)
                                         ↓
              TF-23 → TF-24 → TF-25                     (Inventario)
                                         ↓
              TF-26 → TF-27 → TF-28                     (Corte de caja)
                                         ↓
              TF-29 → TF-30                              (Reportes)
                                         ↓
              TF-31 → TF-32 → TF-33                     (Utilidades y cierre)
```

**Total: 33 tareas atómicas.**

---

## Notas de implementación

- **TF-31 y TF-32** deben implementarse junto con los primeros componentes que los usen (no al final): `formatCurrency` desde TF-16 y toasts desde TF-12.
- **TF-10 (modal de supervisor)** es el componente más reutilizado: ventas (TF-20, TF-21), corte de caja (TF-27). Implementarlo bien en TF-10 evita duplicar código.
- **Orden recomendado de pantallas:** Login → Terminal de ventas → Productos → Corte de caja → Inventario → Reportes. La terminal de ventas es la pantalla más crítica y la más usada; debe quedar perfecta antes de continuar.
