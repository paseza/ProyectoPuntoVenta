export default function AccesoNoPermitido() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">⛔</span>
      <h1 className="text-xl font-bold text-primary-900">Acceso no permitido</h1>
      <p className="text-sm text-gray-500">Tu rol no tiene permiso para ver esta sección.</p>
    </div>
  );
}
