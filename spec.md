# Especificación de Requerimientos — Sistema Punto de Venta (POS)

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Autor:** Analista de Requerimientos
**Estado:** Borrador para revisión  

---

## 1. Visión general

Sistema de punto de venta para comercio minorista que permita registrar ventas, administrar productos e inventario, y realizar corte de caja al cierre del turno. El sistema debe operar en una sola terminal (modo offline-first) con posibilidad de sincronización futura en la nube.

---

## 2. Roles del sistema

| Rol | Descripción |
|-----|-------------|
| **Cajero** | Opera la terminal de venta; registra transacciones y cobra |
| **Administrador** | Gestiona catálogo, inventario, usuarios y consulta reportes |
| **Supervisor** | Autoriza descuentos, devoluciones y accede al corte de caja |

---

## 3. Módulos y Épicas

### 3.1 Módulo de Productos (Catálogo)
### 3.2 Módulo de Ventas (Terminal POS)
### 3.3 Módulo de Inventario
### 3.4 Módulo de Corte de Caja
### 3.5 Módulo de Reportes

---

## 4. Historias de Usuario y Criterios de Aceptación

---

### Épica 1: Gestión de Catálogo de Productos

#### HU-01 — Alta de producto

> Como **administrador**, quiero registrar nuevos productos con nombre, precio, categoría y código de barras, para tenerlos disponibles en la terminal de venta.

**Criterios de aceptación:**

```
Given que el administrador está en la pantalla de "Nuevo producto"
When ingresa nombre, precio de venta, unidad de medida y código de barras válido
And hace clic en "Guardar"
Then el producto queda registrado en el catálogo
And es buscable por nombre o código de barras desde la terminal de venta
```

```
Given que el administrador ingresa un código de barras duplicado
When intenta guardar el producto
Then el sistema muestra el error "Este código ya existe" sin guardar el registro
```

---

#### HU-02 — Edición de precio

> Como **administrador**, quiero actualizar el precio de un producto sin afectar las ventas ya registradas, para mantener precios vigentes.

**Criterios de aceptación:**

```
Given que el administrador localiza un producto existente
When modifica el precio de venta y guarda
Then el nuevo precio aplica únicamente a ventas futuras
And el historial de ventas anteriores conserva el precio al momento de la venta
```

---

#### HU-03 — Desactivación de producto

> Como **administrador**, quiero desactivar un producto del catálogo sin eliminarlo, para conservar el historial de ventas.

**Criterios de aceptación:**

```
Given que el administrador desactiva un producto
When el cajero busca ese producto en la terminal
Then el sistema no lo muestra en los resultados de búsqueda
And el administrador puede reactivarlo en cualquier momento desde el catálogo
```

---

### Épica 2: Terminal de Venta (POS)

#### HU-04 — Registro de venta

> Como **cajero**, quiero agregar productos a una venta mediante código de barras o búsqueda por nombre, para generar un ticket rápidamente.

**Criterios de aceptación:**

```
Given que el cajero tiene una venta abierta
When escanea un código de barras o escribe el nombre del producto
Then el producto aparece en la lista de la venta con precio unitario y cantidad 1
And el total se actualiza en tiempo real
```

```
Given que el cajero escanea un código no registrado
When el sistema no encuentra el producto
Then muestra el aviso "Producto no encontrado" sin agregar nada a la venta
```

---

#### HU-05 — Modificar cantidad o eliminar ítem

> Como **cajero**, quiero ajustar la cantidad de un producto o quitarlo de la venta, para corregir errores antes de cobrar.

**Criterios de aceptación:**

```
Given que hay al menos un producto en la venta activa
When el cajero cambia la cantidad a un número mayor que cero
Then el subtotal del ítem y el total general se recalculan automáticamente
```

```
Given que el cajero elimina un ítem de la venta
When confirma la acción
Then el ítem desaparece de la lista y el total se actualiza
```

---

#### HU-06 — Aplicar descuento

> Como **cajero**, quiero aplicar un descuento porcentual o de monto fijo con autorización del supervisor, para respetar las políticas de precio.

**Criterios de aceptación:**

```
Given que el cajero solicita un descuento en la venta
When el supervisor ingresa su PIN de autorización y el valor del descuento
Then el descuento se aplica al total
And queda registrado en el ticket con el nombre del supervisor que lo autorizó
```

```
Given que el descuento ingresado supera el límite configurado (p. ej. 30%)
When el supervisor intenta autorizar
Then el sistema rechaza la operación con el aviso "Descuento fuera del límite permitido"
```

---

#### HU-07 — Cobro y métodos de pago

> Como **cajero**, quiero registrar el pago con efectivo, tarjeta o ambos (pago mixto), para cerrar la venta correctamente.

**Criterios de aceptación:**

```
Given que la venta tiene ítems y el cajero selecciona "Cobrar"
When elige "Efectivo" e ingresa el monto recibido mayor o igual al total
Then el sistema calcula el cambio y cierra la venta
And genera el folio de ticket con número consecutivo
```

```
Given que el cajero selecciona pago con tarjeta
When el sistema registra el monto como "Tarjeta"
Then la venta se cierra sin calcular cambio
And el ticket indica el método de pago usado
```

```
Given que el cajero registra pago mixto (efectivo + tarjeta)
When la suma de ambos montos es igual o mayor al total
Then la venta se cierra y el ticket detalla cada método y montos parciales
```

---

#### HU-08 — Devolución de venta

> Como **supervisor**, quiero procesar la devolución total o parcial de una venta, para devolver dinero al cliente y reponer el inventario.

**Criterios de aceptación:**

```
Given que el supervisor localiza un folio de venta por número o fecha
When selecciona los ítems a devolver y confirma con su PIN
Then el sistema genera una nota de devolución vinculada al folio original
And el inventario de los productos devueltos se incrementa automáticamente
And el monto se registra como egreso en la caja del turno actual
```

---

### Épica 3: Inventario

#### HU-09 — Entrada de mercancía

> Como **administrador**, quiero registrar entradas de inventario por producto, para mantener el stock actualizado.

**Criterios de aceptación:**

```
Given que el administrador registra una entrada de mercancía
When ingresa el producto, cantidad y costo unitario de compra
Then el stock disponible del producto aumenta en la cantidad indicada
And se registra un movimiento de entrada con fecha, hora y usuario
```

---

#### HU-10 — Alerta de stock mínimo

> Como **administrador**, quiero recibir alertas cuando el inventario de un producto cae por debajo del mínimo definido, para hacer pedidos a tiempo.

**Criterios de aceptación:**

```
Given que un producto tiene configurado un stock mínimo
When una venta reduce el stock disponible por debajo de ese mínimo
Then el sistema genera una alerta visible en el panel de administración
And la alerta persiste hasta que el stock supere nuevamente el mínimo
```

---

#### HU-11 — Ajuste de inventario

> Como **administrador**, quiero registrar ajustes manuales de inventario (merma, robo, error de conteo), para que el stock refleje la realidad.

**Criterios de aceptación:**

```
Given que el administrador realiza un ajuste de inventario
When ingresa la cantidad final real y el motivo del ajuste
Then el sistema actualiza el stock y registra el movimiento con motivo, fecha y usuario
```

---

### Épica 4: Corte de Caja

#### HU-12 — Apertura de turno

> Como **cajero o supervisor**, quiero registrar el fondo inicial de caja al abrir un turno, para que el corte final sea preciso.

**Criterios de aceptación:**

```
Given que no hay un turno activo en la terminal
When el cajero ingresa el monto del fondo inicial y confirma
Then el turno queda abierto con la hora de inicio registrada
And no se puede abrir un segundo turno simultáneo en la misma terminal
```

---

#### HU-13 — Corte de caja

> Como **supervisor**, quiero generar el corte de caja al cerrar el turno, para conocer el total de ventas, ingresos por método de pago y diferencias.

**Criterios de aceptación:**

```
Given que existe un turno activo con fondo inicial de $500
And se registraron ventas en efectivo por $1,200 y en tarjeta por $800
And no hubo devoluciones en el turno
When el supervisor ingresa $1,700 como efectivo contado físicamente
And confirma el corte con su PIN
Then el sistema cierra el turno y muestra:
  - Fondo inicial: $500
  - Ventas en efectivo: $1,200
  - Ventas con tarjeta: $800
  - Devoluciones: $0
  - Efectivo esperado: $1,700 (fondo + ventas efectivo)
  - Efectivo contado: $1,700
  - Diferencia: $0.00
And el registro de corte almacena fecha, hora exacta y nombre del supervisor
And la terminal queda bloqueada para nuevas ventas hasta abrir un turno nuevo
```

```
Given que el efectivo esperado al cierre es $1,700
When el supervisor ingresa $1,650 como efectivo contado físicamente
And confirma el corte con su PIN
Then el sistema registra una diferencia de -$50 (faltante)
And el campo "Diferencia" se muestra en color rojo con el valor "-$50.00"
And el corte queda guardado con el faltante registrado sin bloquear el cierre
```

```
Given que el efectivo esperado al cierre es $1,700
When el supervisor ingresa $1,750 como efectivo contado físicamente
And confirma el corte con su PIN
Then el sistema registra una diferencia de +$50 (sobrante)
And el campo "Diferencia" se muestra en color verde con el valor "+$50.00"
And el corte queda guardado con el sobrante registrado
```

```
Given que el supervisor cerró el turno exitosamente
When cualquier usuario intenta registrar una nueva venta en la terminal
Then el sistema muestra el mensaje "No hay turno activo. Abre un nuevo turno para continuar."
And no permite agregar productos ni procesar cobros
```

```
Given que en el turno se realizaron ventas en efectivo por $2,000
And se procesó una devolución en efectivo de $300 vinculada a un folio del mismo turno
When el supervisor solicita el corte
Then el efectivo esperado es $2,200 (fondo $500 + ventas $2,000 - devolución $300)
And el resumen muestra la línea "Devoluciones: -$300" de forma explícita
```

---

### Épica 5: Reportes

#### HU-14 — Reporte de ventas del día

> Como **administrador**, quiero consultar el resumen de ventas del día o de un rango de fechas, para evaluar el desempeño del negocio.

**Criterios de aceptación:**

```
Given que el administrador selecciona un rango de fechas
When solicita el reporte de ventas
Then el sistema muestra: total de transacciones, monto total, desglose por método de pago y productos más vendidos
And el reporte puede exportarse a PDF o imprimirse
```

---

#### HU-15 — Reporte de inventario actual

> Como **administrador**, quiero ver el stock actual de todos los productos con alertas de mínimos, para planear compras.

**Criterios de aceptación:**

```
Given que el administrador accede al reporte de inventario
When lo visualiza
Then el sistema lista todos los productos activos con: stock actual, stock mínimo y estatus (OK / Bajo / Agotado)
And los productos con stock en cero o por debajo del mínimo aparecen destacados
```

---

## 5. Restricciones Técnicas

### 5.1 Arquitectura

- La aplicación debe funcionar **sin conexión a internet** (offline-first); las ventas se registran localmente y pueden sincronizarse con un servidor cuando haya conectividad.
- Base de datos local embebida (SQLite o equivalente) en la terminal de venta.
- Interfaz web o de escritorio (a definir en diseño técnico); debe ser operable desde pantalla táctil y teclado físico.

### 5.2 Rendimiento

- El tiempo de respuesta al escanear un código de barras no debe superar **300 ms** para mostrar el producto en pantalla.
- El cierre de una venta (generación de ticket y actualización de inventario) no debe tardar más de **1 segundo**.

### 5.3 Seguridad

- Cada usuario debe autenticarse con usuario y PIN (mínimo 4 dígitos).
- Las sesiones expiran tras **15 minutos de inactividad** en la terminal.
- Las operaciones críticas (descuentos, devoluciones, corte de caja) requieren PIN de supervisor aunque ya haya una sesión de cajero activa.
- Los datos de ventas no pueden eliminarse permanentemente; solo pueden marcarse como anulados con trazabilidad de usuario.

### 5.4 Impresión

- El sistema debe soportar impresoras térmicas de 58 mm y 80 mm vía driver ESC/POS.
- El ticket debe incluir: nombre del negocio, folio, fecha/hora, lista de productos, subtotal, descuento, total, método de pago, cambio y leyenda de agradecimiento.

### 5.5 Integridad de datos

- Toda transacción (venta, devolución, ajuste de inventario, corte de caja) debe registrarse con marca de tiempo, usuario responsable e identificador único.
- No se permiten modificaciones retroactivas a ventas ya cerradas; solo se admiten devoluciones como operación compensatoria.

### 5.6 Compatibilidad

- Sistema operativo objetivo: Windows 10/11 (escritorio) o navegador Chromium actualizado (web).
- Soporte de resolución mínima: 1024 × 768 px.

---

## 6. Fuera del alcance (v1.0)

- Módulo de cuentas por cobrar / crédito a clientes.
- Integración con terminales bancarias (TPV) — el pago con tarjeta se registra manualmente.
- App móvil nativa.
- Facturación electrónica (CFDI) — se considera para v1.1.
- Multi-sucursal y sincronización en la nube.

---

## 7. Glosario

| Término | Definición |
|---------|-----------|
| **Folio** | Número consecutivo único que identifica una venta |
| **Turno** | Período de trabajo de un cajero delimitado por apertura y corte de caja |
| **Fondo de caja** | Efectivo inicial depositado en caja al abrir un turno |
| **Stock mínimo** | Cantidad umbral configurada por producto que dispara una alerta de reposición |
| **Ajuste de inventario** | Corrección manual del stock por merma, robo o error de conteo |
| **Corte de caja** | Proceso de cierre de turno que concilia el efectivo físico con las ventas registradas |
