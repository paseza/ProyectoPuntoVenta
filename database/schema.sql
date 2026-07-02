-- =============================================================
--  POS · Script de creación de base de datos
--  Motor: PostgreSQL 15+  (Supabase compatible)
--  Versión: 2.0 · 2026-06-30
-- =============================================================

-- Extensión para UUIDs (disponible por defecto en Supabase, no se usa aquí
-- pero se activa por convención del proyecto)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. CATEGORÍAS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria  SERIAL          PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL UNIQUE,
    descripcion   TEXT
);

-- -------------------------------------------------------------
-- 2. PRODUCTOS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id_producto    SERIAL          PRIMARY KEY,
    codigo_barras  VARCHAR(50)     NOT NULL UNIQUE,
    nombre         VARCHAR(200)    NOT NULL,
    id_categoria   INTEGER         REFERENCES categorias(id_categoria)
                                   ON UPDATE CASCADE
                                   ON DELETE SET NULL,
    unidad_medida  VARCHAR(10)     NOT NULL DEFAULT 'pza'
                                   CHECK (unidad_medida IN ('pza','kg','lt','caja','metro','otro')),
    precio_venta   NUMERIC(10,2)   NOT NULL CHECK (precio_venta > 0),
    costo_unitario NUMERIC(10,2)            CHECK (costo_unitario >= 0),
    stock_actual   INTEGER         NOT NULL DEFAULT 0,
    stock_minimo   INTEGER         NOT NULL DEFAULT 0,
    activo         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_productos_codigo  ON productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_productos_nombre  ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_activo  ON productos(activo);

-- -------------------------------------------------------------
-- 3. USUARIOS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario  SERIAL          PRIMARY KEY,
    nombre      VARCHAR(150)    NOT NULL,
    usuario     VARCHAR(50)     NOT NULL UNIQUE,
    pin_hash    TEXT            NOT NULL,   -- bcrypt / argon2 hash
    rol         VARCHAR(20)     NOT NULL DEFAULT 'cajero'
                                CHECK (rol IN ('cajero','supervisor','admin')),
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 4. TURNOS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS turnos (
    id_turno      SERIAL          PRIMARY KEY,
    id_usuario    INTEGER         NOT NULL REFERENCES usuarios(id_usuario)
                                  ON UPDATE CASCADE,
    fondo_inicial NUMERIC(10,2)   NOT NULL CHECK (fondo_inicial >= 0),
    apertura_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    cierre_at     TIMESTAMPTZ,
    estado        VARCHAR(10)     NOT NULL DEFAULT 'abierto'
                                  CHECK (estado IN ('abierto','cerrado'))
);

-- Solo puede haber un turno abierto a la vez (índice único parcial)
CREATE UNIQUE INDEX IF NOT EXISTS idx_turnos_unico_abierto
    ON turnos(estado) WHERE estado = 'abierto';

-- -------------------------------------------------------------
-- 5. VENTAS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
    id_venta             SERIAL          PRIMARY KEY,
    folio                VARCHAR(20)     NOT NULL UNIQUE,   -- ej. "V-000001"
    id_turno             INTEGER         NOT NULL REFERENCES turnos(id_turno)
                                         ON UPDATE CASCADE,
    id_cajero            INTEGER         NOT NULL REFERENCES usuarios(id_usuario)
                                         ON UPDATE CASCADE,
    id_supervisor_desc   INTEGER                  REFERENCES usuarios(id_usuario)
                                         ON UPDATE CASCADE,   -- NULL si sin descuento
    subtotal             NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    descuento_monto      NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (descuento_monto >= 0),
    descuento_pct        NUMERIC(5,2)    NOT NULL DEFAULT 0
                                         CHECK (descuento_pct >= 0 AND descuento_pct <= 100),
    total                NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (total >= 0),
    pago_efectivo        NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (pago_efectivo >= 0),
    pago_tarjeta         NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (pago_tarjeta >= 0),
    cambio               NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (cambio >= 0),
    estado               VARCHAR(10)     NOT NULL DEFAULT 'abierta'
                                         CHECK (estado IN ('abierta','cerrada','anulada')),
    id_venta_origen      INTEGER                  REFERENCES ventas(id_venta),  -- para devoluciones
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_turno     ON ventas(id_turno);
CREATE INDEX IF NOT EXISTS idx_ventas_cajero    ON ventas(id_cajero);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha     ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_estado    ON ventas(estado);

-- Validación: pago total debe cubrir el total cuando la venta se cierra
-- (se refuerza también en capa de aplicación)
CREATE OR REPLACE FUNCTION fn_check_pago_venta()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo valida cuando la venta pasa a estado 'cerrada'
    IF NEW.estado = 'cerrada' AND (NEW.pago_efectivo + NEW.pago_tarjeta) < NEW.total THEN
        RAISE EXCEPTION 'El pago no cubre el total de la venta';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ventas_pago_check
BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION fn_check_pago_venta();

-- -------------------------------------------------------------
-- 6. DETALLE DE VENTA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle      SERIAL          PRIMARY KEY,
    id_venta        INTEGER         NOT NULL REFERENCES ventas(id_venta)
                                    ON UPDATE CASCADE ON DELETE CASCADE,
    id_producto     INTEGER         NOT NULL REFERENCES productos(id_producto)
                                    ON UPDATE CASCADE,
    precio_unitario NUMERIC(10,2)   NOT NULL CHECK (precio_unitario >= 0),
    cantidad        INTEGER         NOT NULL CHECK (cantidad > 0),
    subtotal        NUMERIC(10,2)   NOT NULL   -- cantidad * precio_unitario
);

CREATE INDEX IF NOT EXISTS idx_detalle_venta     ON detalle_venta(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_producto  ON detalle_venta(id_producto);

-- Verificar que subtotal = cantidad × precio_unitario al insertar
CREATE OR REPLACE FUNCTION fn_check_detalle_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    IF ABS(NEW.subtotal - (NEW.cantidad * NEW.precio_unitario)) > 0.01 THEN
        RAISE EXCEPTION 'El subtotal no coincide con cantidad × precio';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_detalle_subtotal
BEFORE INSERT ON detalle_venta
FOR EACH ROW EXECUTE FUNCTION fn_check_detalle_subtotal();

-- -------------------------------------------------------------
-- 7. MOVIMIENTOS DE INVENTARIO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id_movimiento  SERIAL          PRIMARY KEY,
    id_producto    INTEGER         NOT NULL REFERENCES productos(id_producto)
                                   ON UPDATE CASCADE,
    id_usuario     INTEGER         NOT NULL REFERENCES usuarios(id_usuario)
                                   ON UPDATE CASCADE,
    tipo           VARCHAR(15)     NOT NULL
                                   CHECK (tipo IN ('entrada','salida','ajuste','devolucion')),
    cantidad       INTEGER         NOT NULL,   -- positivo = entrada, negativo = salida/ajuste
    stock_anterior INTEGER         NOT NULL,
    stock_nuevo    INTEGER         NOT NULL,
    motivo         TEXT,
    id_venta       INTEGER                  REFERENCES ventas(id_venta),   -- NULL si no aplica
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_producto  ON movimientos_inventario(id_producto);
CREATE INDEX IF NOT EXISTS idx_mov_fecha     ON movimientos_inventario(created_at);

-- Actualizar stock en productos al registrar un movimiento
CREATE OR REPLACE FUNCTION fn_actualiza_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET    stock_actual = NEW.stock_nuevo,
           updated_at   = NOW()
    WHERE  id_producto  = NEW.id_producto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mov_actualiza_stock
AFTER INSERT ON movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION fn_actualiza_stock();

-- -------------------------------------------------------------
-- 8. CORTE DE CAJA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS corte_caja (
    id_corte            SERIAL          PRIMARY KEY,
    id_turno            INTEGER         NOT NULL UNIQUE REFERENCES turnos(id_turno)
                                        ON UPDATE CASCADE,
    id_supervisor       INTEGER         NOT NULL REFERENCES usuarios(id_usuario)
                                        ON UPDATE CASCADE,
    fondo_inicial       NUMERIC(10,2)   NOT NULL CHECK (fondo_inicial >= 0),
    ventas_efectivo     NUMERIC(10,2)   NOT NULL DEFAULT 0,
    ventas_tarjeta      NUMERIC(10,2)   NOT NULL DEFAULT 0,
    total_devoluciones  NUMERIC(10,2)   NOT NULL DEFAULT 0,
    efectivo_esperado   NUMERIC(10,2)   NOT NULL,   -- fondo + ventas_efectivo - devoluciones
    efectivo_contado    NUMERIC(10,2)   NOT NULL,
    diferencia          NUMERIC(10,2)   NOT NULL,   -- efectivo_contado - efectivo_esperado
    notas               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Al insertar el corte, cerrar el turno automáticamente
CREATE OR REPLACE FUNCTION fn_cierra_turno()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE turnos
    SET    estado    = 'cerrado',
           cierre_at = NOW()
    WHERE  id_turno  = NEW.id_turno;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_corte_cierra_turno
AFTER INSERT ON corte_caja
FOR EACH ROW EXECUTE FUNCTION fn_cierra_turno();

-- =============================================================
--  DATOS INICIALES (seed)
-- =============================================================

-- Categorías de ejemplo
INSERT INTO categorias (nombre) VALUES
    ('General'),
    ('Alimentos'),
    ('Bebidas'),
    ('Limpieza'),
    ('Papelería')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario administrador por defecto (PIN: 1234 → reemplazar hash en producción)
INSERT INTO usuarios (nombre, usuario, pin_hash, rol) VALUES
    ('Administrador', 'admin', '$2b$10$REEMPLAZAR_HASH_EN_PRODUCCION', 'admin')
ON CONFLICT (usuario) DO NOTHING;

-- =============================================================
--  VISTAS ÚTILES
-- =============================================================

-- Productos con estado de stock
CREATE OR REPLACE VIEW v_stock_status AS
SELECT
    p.id_producto,
    p.codigo_barras,
    p.nombre,
    c.nombre        AS categoria,
    p.stock_actual,
    p.stock_minimo,
    CASE
        WHEN p.stock_actual  = 0               THEN 'Agotado'
        WHEN p.stock_actual <= p.stock_minimo   THEN 'Bajo'
        ELSE                                         'OK'
    END AS estatus
FROM  productos p
LEFT  JOIN categorias c USING (id_categoria)
WHERE p.activo = TRUE;

-- Resumen de ventas por turno
CREATE OR REPLACE VIEW v_resumen_turno AS
SELECT
    t.id_turno,
    u.nombre                                                                                  AS cajero,
    t.apertura_at,
    t.cierre_at,
    t.estado,
    t.fondo_inicial,
    COALESCE(SUM(CASE WHEN v.estado = 'cerrada' THEN v.pago_efectivo  ELSE 0 END), 0)        AS total_efectivo,
    COALESCE(SUM(CASE WHEN v.estado = 'cerrada' THEN v.pago_tarjeta   ELSE 0 END), 0)        AS total_tarjeta,
    COALESCE(SUM(CASE WHEN v.estado = 'cerrada' THEN v.total           ELSE 0 END), 0)        AS total_ventas,
    COUNT(CASE WHEN v.estado = 'cerrada'                               THEN 1 END)            AS num_ventas,
    COUNT(CASE WHEN v.id_venta_origen IS NOT NULL AND v.estado = 'cerrada' THEN 1 END)        AS num_devoluciones
FROM  turnos   t
JOIN  usuarios u ON u.id_usuario = t.id_usuario
LEFT  JOIN ventas v ON v.id_turno = t.id_turno
GROUP BY t.id_turno, u.nombre, t.apertura_at, t.cierre_at, t.estado, t.fondo_inicial;
