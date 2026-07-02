import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-institucional-grisClaro text-center">
      <h1 className="text-2xl font-bold text-primary-900">404 — Página no encontrada</h1>
      <Link
        to="/"
        className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
