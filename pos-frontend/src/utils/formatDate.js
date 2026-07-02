const formateador = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatDate(fechaIso) {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return '';
  return formateador.format(fecha).replace(',', '');
}
