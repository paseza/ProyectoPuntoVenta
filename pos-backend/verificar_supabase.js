// Pega este archivo en la raiz de pos-backend y ejecuta:
// node verificar_supabase.js
require('dotenv').config();

console.log('\n=== VERIFICACIÓN DE VARIABLES .env ===');
console.log('SUPABASE_URL:',
  process.env.SUPABASE_URL
    ? process.env.SUPABASE_URL
    : '❌ NO DEFINIDA'
);
console.log('SUPABASE_SERVICE_ROLE_KEY:',
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? '✅ definida (' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0,20) + '...)'
    : '❌ NO DEFINIDA'
);
console.log('JWT_SECRET:',
  process.env.JWT_SECRET ? '✅ definida' : '❌ NO DEFINIDA'
);

// Intento de conexión real
const { createClient } = require('@supabase/supabase-js');

async function probar() {
  console.log('\n=== PRUEBA DE CONEXIÓN A SUPABASE ===');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.error('❌ Error de Supabase:', error.message, '| Código:', error.code);
    } else {
      console.log('✅ Conexión exitosa. Supabase responde correctamente.');
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
  }
}

probar();
