import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import UserHome from './pages/UserHome';
import TiempoReal from './pages/TiempoReal';
import Unauthorized from './pages/Unauthorized';
import Areas from './pages/Areas';
import InHouses from './pages/InHouses';
import InHousesAdmin from './pages/InHousesAdmin';
import EncargadoDashboard from './pages/EncargadoDashboard';
import EncargadoTiempoReal from './pages/EncargadoTiempoReal';
import AdminAreaDashboard from './pages/AdminAreaDashboard';
import AdminAreaTiempoReal from './pages/AdminAreaTiempoReal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Ruta de acceso denegado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rutas protegidas para Admin y CEO */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute rolesPermitidos={['admin', 'ceo']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute rolesPermitidos={['admin']}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tiempo-real"
              element={
                <ProtectedRoute rolesPermitidos={['admin', 'ceo']}>
                  <TiempoReal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/areas"
              element={
                <ProtectedRoute rolesPermitidos={['admin']}>
                  <Areas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/areas/:areaId/inhouses"
              element={
                <ProtectedRoute rolesPermitidos={['admin', 'admin_area']}>
                  <InHouses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inhouses"
              element={
                <ProtectedRoute rolesPermitidos={['admin']}>
                  <InHousesAdmin />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida para usuarios normales */}
            <Route
              path="/user/home"
              element={
                <ProtectedRoute rolesPermitidos={['user']}>
                  <UserHome />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas para encargados de InHouse */}
            <Route
              path="/encargado/dashboard"
              element={
                <ProtectedRoute rolesPermitidos={['encargado_inhouse']}>
                  <EncargadoDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/encargado/tiempo-real"
              element={
                <ProtectedRoute rolesPermitidos={['encargado_inhouse']}>
                  <EncargadoTiempoReal />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas para administradores de área */}
            <Route
              path="/admin-area/dashboard"
              element={
                <ProtectedRoute rolesPermitidos={['admin_area']}>
                  <AdminAreaDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin-area/tiempo-real"
              element={
                <ProtectedRoute rolesPermitidos={['admin_area']}>
                  <AdminAreaTiempoReal />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
