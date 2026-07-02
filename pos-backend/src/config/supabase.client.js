// Cliente de Supabase usando la service role key (acceso completo desde el backend)
const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
