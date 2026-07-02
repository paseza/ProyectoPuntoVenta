const formateador = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatCurrency(valor) {
  const numero = Number(valor) || 0;
  return formateador.format(numero);
}
