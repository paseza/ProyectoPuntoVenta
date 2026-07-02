import { useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import PinPad from './components/PinPad.jsx';
import { useAuth } from './hooks/useAuth.js';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [pin, setPin] = useState('');
  const { iniciarSesionConCredenciales, error, cargando } = useAuth();

  const puedeConfirmar = usuario.trim().length > 0 && pin.length >= 4 && !cargando;

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    const exito = await iniciarSesionConCredenciales(usuario, pin);
    if (!exito) {
      setPin('');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-institucional-gris px-4">
      <form
        onSubmit={manejarSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-700 text-lg font-bold text-white shadow-sm">
          PV
        </div>
        <h1 className="mb-1 text-center text-xl font-bold text-primary-900">
          Punto de Venta
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Ingresa tu usuario y PIN para continuar
        </p>

        <div className="flex flex-col gap-4">
          <Input
            label="Usuario"
            name="usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoFocus
          />

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-700">PIN</span>
            <PinPad value={pin} onChange={setPin} autoFocusInput={false} />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={!puedeConfirmar} className="w-full">
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
