import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Clock } from 'lucide-react';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());
  
  const { iniciarSesion, autenticado, usuario } = useAuth();
  const navigate = useNavigate();

  // Actualizar hora cada segundo
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (autenticado && usuario) {
      if (usuario.rol === 'admin' || usuario.rol === 'ceo') {
        navigate('/admin/dashboard');
      } else if (usuario.rol === 'encargado_inhouse') {
        navigate('/encargado/dashboard');
      } else if (usuario.rol === 'admin_area') {
        navigate('/admin-area/dashboard');
      } else {
        navigate('/user/home');
      }
    }
  }, [autenticado, usuario, navigate]);

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!correo || !password) {
      return;
    }

    setCargando(true);
    
    const resultado = await iniciarSesion(correo, password);
    
    if (resultado.success) {
      // La redirección se maneja en el useEffect
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center p-4 animate-gradient">
      <div className="w-full max-w-md">
        {/* Reloj y fecha */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-white mr-2" size={24} />
              <h2 className="text-4xl font-bold text-white">
                {formatearHora(horaActual)}
              </h2>
            </div>
            <p className="text-white/90 text-sm capitalize">
              {formatearFecha(horaActual)}
            </p>
          </div>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Sistema de Asistencia
            </h1>
            <p className="text-gray-600">
              Ingresa tus credenciales para registrar tu asistencia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de correo */}
            <div>
              <label className="label-field">
                <Mail className="inline mr-2" size={16} />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="input-field"
                placeholder="tu.correo@empresa.com"
                required
                disabled={cargando}
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <label className="label-field">
                <Lock className="inline mr-2" size={16} />
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                disabled={cargando}
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={20} />
                  Iniciar Sesión y Registrar Asistencia
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-accent rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <span className="font-semibold">📌 Nota:</span> Al iniciar sesión, tu asistencia se registrará automáticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>© {new Date().getFullYear()} Sistema de Control de Asistencia</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
