import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import VentasPage from '../features/ventas/VentasPage.jsx';
import ProductosPage from '../features/productos/ProductosPage.jsx';
import CorteCajaPage from '../features/corte-caja/CorteCajaPage.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="/ventas" replace />} />

        <Route
          path="/ventas"
          element={
            <RutaProtegida roles={['cajero', 'supervisor', 'admin']}>
              <VentasPage />
            </RutaProtegida>
          }
        />

        <Route
          path="/productos"
          element={
            <RutaProtegida roles={['admin']}>
              <ProductosPage />
            </RutaProtegida>
          }
        />

        <Route
          path="/corte-caja"
          element={
            <RutaProtegida roles={['supervisor', 'admin']}>
              <CorteCajaPage />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
