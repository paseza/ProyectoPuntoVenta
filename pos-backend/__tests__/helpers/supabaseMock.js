// Helper para simular el query builder encadenable de @supabase/supabase-js con jest.mock().
// Cada método encadenable (select, insert, eq, etc.) devuelve el mismo objeto para permitir
// encadenar llamadas, y el builder es "thenable" para soportar tanto
// `await supabase.from(x)...eq(y)` (sin .single()) como `...select().single()`.
function crearQueryBuilderMock(resultado = { data: null, error: null }) {
  const builder = {};
  const metodosEncadenables = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'in',
    'gte',
    'lt',
    'is',
    'ilike',
    'order',
    'limit',
  ];

  metodosEncadenables.forEach((metodo) => {
    builder[metodo] = jest.fn(() => builder);
  });

  builder.single = jest.fn(() => Promise.resolve(resultado));
  builder.maybeSingle = jest.fn(() => Promise.resolve(resultado));
  builder.then = (onFulfilled, onRejected) => Promise.resolve(resultado).then(onFulfilled, onRejected);

  return builder;
}

module.exports = { crearQueryBuilderMock };
