erDiagram

    %% ─── CATÁLOGO ───────────────────────────────────────────────
    categorias {
        INTEGER  id_categoria   PK
        TEXT     nombre         "NOT NULL UNIQUE"
        TEXT     descripcion
    }

    productos {
        INTEGER  id_producto    PK
        TEXT     codigo_barras  "NOT NULL UNIQUE"
        TEXT     nombre         "NOT NULL"
        INTEGER  id_categoria   FK
        TEXT     unidad_medida  "pza|kg|lt|caja"
        REAL     precio_venta   "NOT NULL CHECK > 0"
        REAL     costo_unitario
        INTEGER  stock_actual   "NOT NULL DEFAULT 0"
        INTEGER  stock_minimo   "DEFAULT 0"
        INTEGER  activo         "DEFAULT 1 (bool)"
        TEXT     created_at     "DATETIME DEFAULT NOW"
        TEXT     updated_at     "DATETIME"
    }

    %% ─── USUARIOS / ROLES ───────────────────────────────────────
    usuarios {
        INTEGER  id_usuario     PK
        TEXT     nombre         "NOT NULL"
        TEXT     usuario        "NOT NULL UNIQUE"
        TEXT     pin_hash       "NOT NULL"
        TEXT     rol            "cajero|supervisor|admin"
        INTEGER  activo         "DEFAULT 1"
        TEXT     created_at     "DATETIME DEFAULT NOW"
    }

    %% ─── TURNOS ─────────────────────────────────────────────────
    turnos {
        INTEGER  id_turno       PK
        INTEGER  id_usuario     FK "quien abre"
        REAL     fondo_inicial  "NOT NULL"
        TEXT     apertura_at    "DATETIME NOT NULL"
        TEXT     cierre_at      "DATETIME"
        TEXT     estado         "abierto|cerrado"
    }

    %% ─── VENTAS ─────────────────────────────────────────────────
    ventas {
        INTEGER  id_venta           PK
        TEXT     folio               "NOT NULL UNIQUE"
        INTEGER  id_turno            FK
        INTEGER  id_cajero           FK
        INTEGER  id_supervisor_desc  FK "NULL si sin descuento"
        REAL     subtotal            "NOT NULL"
        REAL     descuento_monto     "DEFAULT 0"
        REAL     descuento_pct       "DEFAULT 0"
        REAL     total               "NOT NULL"
        REAL     pago_efectivo       "DEFAULT 0"
        REAL     pago_tarjeta        "DEFAULT 0"
        REAL     cambio              "DEFAULT 0"
        TEXT     estado              "cerrada|anulada"
        INTEGER  id_venta_origen     FK "NULL; para devoluciones"
        TEXT     created_at          "DATETIME DEFAULT NOW"
    }

    %% ─── DETALLE DE VENTA ───────────────────────────────────────
    detalle_venta {
        INTEGER  id_detalle     PK
        INTEGER  id_venta       FK
        INTEGER  id_producto    FK
        REAL     precio_unitario "precio al momento de la venta"
        INTEGER  cantidad       "NOT NULL CHECK > 0"
        REAL     subtotal       "cantidad * precio_unitario"
    }

    %% ─── MOVIMIENTOS DE INVENTARIO ──────────────────────────────
    movimientos_inventario {
        INTEGER  id_movimiento  PK
        INTEGER  id_producto    FK
        INTEGER  id_usuario     FK
        TEXT     tipo           "entrada|salida|ajuste|devolucion"
        INTEGER  cantidad       "NOT NULL (+ o -)"
        INTEGER  stock_anterior "NOT NULL"
        INTEGER  stock_nuevo    "NOT NULL"
        TEXT     motivo
        INTEGER  id_venta       FK "NULL si no es por venta"
        TEXT     created_at     "DATETIME DEFAULT NOW"
    }

    %% ─── CORTE DE CAJA ──────────────────────────────────────────
    corte_caja {
        INTEGER  id_corte           PK
        INTEGER  id_turno           FK
        INTEGER  id_supervisor      FK
        REAL     fondo_inicial       "NOT NULL"
        REAL     ventas_efectivo     "NOT NULL"
        REAL     ventas_tarjeta      "NOT NULL"
        REAL     total_devoluciones  "DEFAULT 0"
        REAL     efectivo_esperado   "NOT NULL"
        REAL     efectivo_contado    "NOT NULL"
        REAL     diferencia          "contado - esperado"
        TEXT     notas
        TEXT     created_at          "DATETIME DEFAULT NOW"
    }

    %% ─── RELACIONES ─────────────────────────────────────────────
    categorias        ||--o{ productos              : "clasifica"
    usuarios          ||--o{ turnos                 : "abre"
    turnos            ||--o{ ventas                 : "contiene"
    usuarios          ||--o{ ventas                 : "cajero registra"
    usuarios          ||--o{ ventas                 : "supervisor autoriza desc"
    ventas            ||--o{ detalle_venta           : "tiene"
    productos         ||--o{ detalle_venta           : "aparece en"
    productos         ||--o{ movimientos_inventario  : "afecta"
    usuarios          ||--o{ movimientos_inventario  : "registra"
    ventas            ||--o{ movimientos_inventario  : "genera"
    turnos            ||--|| corte_caja              : "cierra con"
    usuarios          ||--o{ corte_caja              : "supervisor ejecuta"
    ventas            ||--o{ ventas                  : "devolucion de"
