# Manual de Usuario — Sistema de Punto de Venta

Esta guía te explica, paso a paso y sin tecnicismos, cómo usar el sistema para vender, buscar productos y revisar el corte de caja al final del turno.

## Contenido

- [Cómo iniciar sesión](#cómo-iniciar-sesión)
- [1. Cómo buscar un producto](#1-cómo-buscar-un-producto)
- [2. Cómo registrar una venta](#2-cómo-registrar-una-venta)
- [3. Cómo consultar el corte de caja](#3-cómo-consultar-el-corte-de-caja)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Glosario de términos](#glosario-de-términos)

---

## Cómo iniciar sesión

1. Abre el sistema en tu computadora o pantalla táctil.
2. Escribe tu **usuario** en el primer campo.
3. Escribe tu **PIN** (te lo da tu administrador) en el segundo campo. Puedes usar los botones numéricos en pantalla o tu teclado.
4. Presiona **Ingresar**.
5. Si tu usuario o PIN están mal escritos, verás un mensaje en rojo que dice "Usuario o PIN incorrectos". Borra el PIN e inténtalo de nuevo.
6. Si todo está correcto, entrarás directo a la pantalla de **Ventas**. Verás tu nombre y tu rol (cajero, supervisor o administrador) en la esquina superior derecha.

> 💡 Si no usas el sistema por 15 minutos, tu sesión se cierra sola por seguridad y tendrás que volver a iniciar sesión.

---

## 1. Cómo buscar un producto

La búsqueda de productos se hace desde la pantalla de **Ventas** (la que ves al iniciar sesión), en el recuadro grande de la parte superior que dice *"Escanea o escribe un código de barras / nombre del producto"*.

1. Ve a la pantalla **Ventas** (haz clic en "Ventas" en el menú de la izquierda si no estás ahí).
2. Da clic sobre el recuadro de búsqueda para asegurarte de que el cursor esté ahí (normalmente ya está listo para escribir).
3. Tienes dos formas de buscar:
   - **Con pistola escáner**: apunta y dispara sobre el código de barras del producto. El sistema lo agrega automáticamente.
   - **A mano**: escribe el nombre del producto o su código de barras y presiona **Enter**.
4. Si el producto existe, aparece de inmediato en el carrito de la derecha, con su precio y cantidad 1.
5. Si el producto **no existe** o escribiste mal el código, verás el mensaje **"Producto no encontrado"** debajo del recuadro de búsqueda. Revisa el código o el nombre e inténtalo otra vez.

> 💡 Si necesitas buscar un producto solo para revisar su precio o si está disponible (sin vender todavía), un administrador puede consultarlo en la sección **Productos** del menú, donde también se puede buscar por nombre o código.

---

## 2. Cómo registrar una venta

### Paso 0: Verifica que haya un turno abierto

Antes de vender, debe existir un **turno abierto** (el periodo de trabajo de la caja). Si no lo hay, verás un aviso amarillo que dice *"No hay turno activo. Abre un turno para comenzar a vender."*

1. Da clic en el botón **Abrir turno**.
2. Escribe el **fondo inicial de caja** (el efectivo con el que empiezas, por ejemplo $500).
3. Confirma. El aviso amarillo desaparecerá y ya puedes vender.

> Si otra persona ya abrió un turno, el sistema te avisará que ya existe uno activo — no hace falta abrir otro.

### Paso a paso para vender

1. Con el turno abierto, busca el primer producto (ver la sección [1. Cómo buscar un producto](#1-cómo-buscar-un-producto)).
2. El producto aparece en el carrito, a la derecha de la pantalla, con su nombre, precio y cantidad.
3. Repite la búsqueda por cada producto que el cliente va a comprar. Si escaneas el mismo producto otra vez, el sistema solo aumenta la cantidad — no lo duplica.
4. **¿Necesitas cambiar la cantidad de un producto?** Da clic sobre el número de cantidad en el carrito, bórralo, escribe la cantidad correcta y da clic fuera del cuadro. El total se actualiza solo.
5. **¿Necesitas quitar un producto del carrito?** Da clic en el ícono de basura (🗑) junto al producto.
6. Revisa que el **Total** (abajo del carrito) sea el correcto.
7. Da clic en el botón **Cobrar**.
8. Se abre una ventana con el total a pagar. Ahí:
   - Si el cliente paga en **efectivo**, escribe el monto que te dio en el campo "Efectivo". El **Cambio** se calcula solo y aparece de inmediato.
   - Si el cliente paga con **tarjeta**, escribe el monto en el campo "Tarjeta".
   - Si paga con una combinación de ambos (pago mixto), llena los dos campos.
9. Si el dinero ingresado no alcanza para cubrir el total, el botón **Confirmar cobro** permanece apagado y verás el mensaje **"Pago insuficiente"**. Corrige los montos.
10. Cuando el pago sea suficiente, da clic en **Confirmar cobro**.
11. El sistema muestra el **ticket de venta** en pantalla, con el folio (número de la venta), los productos, el total, la forma de pago y el cambio.
12. Si el negocio tiene impresora de tickets, da clic en **Imprimir ticket**.
13. Cierra la ventana del ticket. El carrito queda vacío y listo para la siguiente venta.

> 💡 **¿Un cliente quiere un descuento?** Solo un supervisor puede autorizarlo. Pide que ingrese su usuario y PIN cuando el sistema lo solicite.

---

## 3. Cómo consultar el corte de caja

El **corte de caja** es el resumen de todo el dinero que entró y salió durante el turno (para saber si el efectivo en la caja coincide con lo que el sistema registró). Solo lo pueden hacer un **supervisor** o un **administrador**.

### Ver el resumen del turno actual

1. Da clic en **Corte de caja** en el menú de la izquierda.
2. Estarás en la pestaña **Corte**. Ahí verás el **fondo inicial** con el que se abrió el turno.
3. Cuenta físicamente el efectivo que hay en la caja.
4. Escribe esa cantidad en el campo **"Efectivo contado físicamente"**.
5. Da clic en **Cerrar turno**.
6. El sistema te pedirá **usuario y PIN de supervisor** para confirmar. Ingrésalos y confirma.
7. Aparece el resumen final del corte, con estos datos:
   - **Fondo inicial**: con lo que se abrió la caja.
   - **Ventas en efectivo** y **Ventas con tarjeta**: lo vendido en el turno.
   - **Devoluciones**: dinero regresado a clientes, si hubo alguna.
   - **Efectivo esperado**: lo que el sistema calcula que debería haber en la caja.
   - **Efectivo contado**: lo que tú escribiste que contaste.
   - **Diferencia**: la comparación entre lo esperado y lo contado.
     - Si dice **$0.00 en gris**, cuadró perfecto.
     - Si está **en rojo con un signo "−"**, falta dinero en caja.
     - Si está **en verde con un signo "+"**, sobra dinero en caja.
8. Si quieres una copia impresa, da clic en **Imprimir corte**.

> ⚠️ Una vez que cierras el turno, la terminal **no permite vender de nuevo** hasta que alguien abra un turno nuevo.

### Ver cortes de caja anteriores

1. Dentro de **Corte de caja**, da clic en la pestaña **Historial**.
2. Verás una tabla con los últimos cortes realizados: fecha, quién lo hizo, ventas totales y la diferencia de cada uno.
3. Si buscas un corte de una fecha específica, usa los campos **"Desde"** y **"Hasta"** para filtrar por rango de fechas.

---

## Preguntas frecuentes

**¿Qué significa "No hay turno activo"?**
Que nadie ha abierto la caja todavía. Pide a un cajero o supervisor que abra el turno con el botón "Abrir turno" en la pantalla de Ventas.

**¿Qué hago si el sistema dice "Producto no encontrado"?**
Verifica que escaneaste bien el código de barras o que escribiste correctamente el nombre. Si el producto es nuevo, pide a un administrador que lo registre en la sección Productos.

**¿Por qué no puedo confirmar el cobro?**
Porque el dinero que escribiste (efectivo + tarjeta) todavía no cubre el total de la venta. Revisa los montos.

**¿Qué hago si me pide un PIN de supervisor y no soy supervisor?**
Busca a tu supervisor o administrador para que ingrese su usuario y PIN. Esto pasa en descuentos, devoluciones y en el corte de caja — son pasos que requieren su autorización por seguridad.

**Cerré sesión por accidente / la sesión se cerró sola, ¿perdí la venta?**
Si la venta ya se había cobrado y confirmado, no se pierde: queda guardada con su folio. Si estabas a la mitad de armar un carrito sin cobrar, sí tendrás que volver a agregar los productos.

**¿Puedo eliminar una venta ya cobrada?**
No. Por seguridad, las ventas cerradas no se pueden borrar ni modificar. Si el cliente necesita devolver algo, un supervisor debe hacerlo a través de una devolución, buscando el folio de la venta original.

---

## Glosario de términos

| Término | Qué significa |
|---|---|
| **Turno** | El periodo de trabajo de la caja, desde que se abre con un fondo inicial hasta que se hace el corte |
| **Folio** | El número único que identifica cada venta (por ejemplo, V-000101) |
| **Fondo inicial** | El efectivo con el que se abre la caja al empezar el turno |
| **PIN** | La contraseña numérica personal para entrar al sistema o autorizar una acción |
| **Corte de caja** | El resumen y cierre del turno, comparando el efectivo esperado contra el contado |
| **Diferencia (corte de caja)** | La diferencia entre el efectivo que debería haber y el que realmente hay en caja |
