// Genera folios consecutivos con formato "V-000001".
// Consulta el último folio existente y suma 1. La colisión bajo concurrencia
// se previene a nivel de base de datos gracias al UNIQUE en ventas.folio:
// si dos requests generan el mismo folio, el segundo INSERT falla con 23505
// y el servicio de ventas debe reintentar (ver ventas.service.js).
const supabase = require('../config/supabase.client');
const ErrorApp = require('../lib/errorApp');

const PREFIJO = 'V-';
const LONGITUD_NUMERO = 6;

async function generarSiguienteFolio() {
  const { data, error } = await supabase
    .from('ventas')
    .select('folio')
    .order('id_venta', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ErrorApp('No se pudo generar el folio de venta', 500);
  }

  let siguienteNumero = 1;

  if (data && data.folio) {
    const numeroActual = parseInt(data.folio.replace(PREFIJO, ''), 10);
    if (!Number.isNaN(numeroActual)) {
      siguienteNumero = numeroActual + 1;
    }
  }

  return `${PREFIJO}${String(siguienteNumero).padStart(LONGITUD_NUMERO, '0')}`;
}

module.exports = { generarSiguienteFolio };
