import { Component } from 'react';

// Captura errores de renderizado no controlados para que la aplicación
// nunca muestre una pantalla en blanco sin explicación (TF-32).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800">Ocurrió un error inesperado</h1>
          <p className="max-w-md text-sm text-gray-500">
            La aplicación encontró un problema y no puede continuar. Intenta recargar la página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[44px] rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
