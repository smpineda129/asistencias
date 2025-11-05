import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  Menu,
  X,
  Activity,
  Building2,
  Fingerprint
} from 'lucide-react';

const Navbar = () => {
  const { usuario, cerrarSesion, esAdmin, esCEO } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = React.useState(false);

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  const esRutaActiva = (ruta) => {
    return location.pathname === ruta;
  };

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
        esRutaActiva(to)
          ? 'bg-white text-primary font-semibold shadow-md'
          : 'text-white hover:bg-white/10'
      }`}
      onClick={() => setMenuAbierto(false)}
    >
      <Icon size={18} className="mr-2" />
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-white rounded-lg p-2 mr-3">
                <ClipboardList className="text-primary" size={24} />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">
                Sistema de Asistencia
              </span>
            </Link>
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {(esAdmin() || esCEO()) && (
              <>
                <NavLink to="/admin/dashboard" icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/tiempo-real" icon={Activity}>
                  Tiempo Real
                </NavLink>
                {esAdmin() && (
                  <>
                    <NavLink to="/admin/usuarios" icon={Users}>
                      Usuarios
                    </NavLink>
                    <NavLink to="/areas" icon={Building2}>
                      Áreas
                    </NavLink>
                    <NavLink to="/admin/biometric" icon={Fingerprint}>
                      Biometría
                    </NavLink>
                  </>
                )}
              </>
            )}

            {/* Info del usuario */}
            <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 ml-4">
              <User size={18} className="text-white mr-2" />
              <div className="text-white">
                <p className="text-sm font-semibold">{usuario?.nombreCompleto}</p>
                <p className="text-xs opacity-90">{usuario?.rol?.toUpperCase()}</p>
              </div>
            </div>

            {/* Botón cerrar sesión */}
            <button
              onClick={handleCerrarSesion}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <LogOut size={18} className="mr-2" />
              Salir
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {menuAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="space-y-2">
              {(esAdmin() || esCEO()) && (
                <>
                  <NavLink to="/admin/dashboard" icon={LayoutDashboard}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/tiempo-real" icon={Activity}>
                    Tiempo Real
                  </NavLink>
                  {esAdmin() && (
                    <>
                      <NavLink to="/admin/usuarios" icon={Users}>
                        Usuarios
                      </NavLink>
                      <NavLink to="/areas" icon={Building2}>
                        Áreas
                      </NavLink>
                      <NavLink to="/admin/biometric" icon={Fingerprint}>
                        Biometría
                      </NavLink>
                    </>
                  )}
                </>
              )}

              {/* Info del usuario móvil */}
              <div className="bg-white/10 rounded-lg px-4 py-3 mt-4">
                <div className="flex items-center text-white mb-2">
                  <User size={18} className="mr-2" />
                  <div>
                    <p className="text-sm font-semibold">{usuario?.nombreCompleto}</p>
                    <p className="text-xs opacity-90">{usuario?.rol?.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Botón cerrar sesión móvil */}
              <button
                onClick={handleCerrarSesion}
                className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
