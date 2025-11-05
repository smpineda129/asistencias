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
import BiometricManagement from './pages/BiometricManagement';
import BiometricTerminal from './pages/BiometricTerminal';

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
              path="/admin/biometric"
              element={
                <ProtectedRoute rolesPermitidos={['admin', 'admin_area']}>
                  <BiometricManagement />
                </ProtectedRoute>
              }
            />

            {/* Ruta pública para terminal de marcación biométrica */}
            <Route path="/terminal" element={<BiometricTerminal />} />

            {/* Ruta protegida para usuarios normales */}
            <Route
              path="/user/home"
              element={
                <ProtectedRoute rolesPermitidos={['user']}>
                  <UserHome />
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
