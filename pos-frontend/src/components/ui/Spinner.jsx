export default function Spinner({ tamaño = 24 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
      style={{ width: tamaño, height: tamaño }}
      role="status"
      aria-label="Cargando"
    />
  );
}
