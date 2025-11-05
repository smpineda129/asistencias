import React, { useEffect, useState } from 'react';
import { attendanceAPI } from '../utils/api';
import { Users, UserCheck, UserX, RefreshCw, Clock, TrendingUp, LogIn } from 'lucide-react';
import Navbar from '../components/Navbar';

const TiempoReal = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const response = await attendanceAPI.obtenerEstadoTiempoReal();
      setDatos(response.data);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      cargarDatos();
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    cargarDatos();
  };

  if (cargando && !datos) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-accent-light flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos en tiempo real...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-accent-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                <Users className="mr-3 text-primary" size={40} />
                Panel en Tiempo Real
              </h1>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Auto-actualizar (10s)</span>
                </label>
                <button
                  onClick={handleRefresh}
                  disabled={cargando}
                  className="btn-primary flex items-center disabled:opacity-50"
                >
                  <RefreshCw size={18} className={`mr-2 ${cargando ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2" />
              Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
            </div>
          </div>

          {/* Resumen */}
          {datos && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Total Usuarios</p>
                      <p className="text-4xl font-bold">{datos.resumen.totalUsuarios}</p>
                    </div>
                    <Users size={48} className="text-blue-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Activos Ahora</p>
                      <p className="text-4xl font-bold">{datos.resumen.usuariosActivos}</p>
                    </div>
                    <UserCheck size={48} className="text-green-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm mb-1">Sin Ingresar</p>
                      <p className="text-4xl font-bold">{datos.resumen.usuariosInactivos}</p>
                    </div>
                    <UserX size={48} className="text-red-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm mb-1">Ingresos Hoy</p>
                      <p className="text-4xl font-bold">{datos.resumen.totalIngresosHoy}</p>
                    </div>
                    <LogIn size={48} className="text-orange-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">% Activos</p>
                      <p className="text-4xl font-bold">{datos.resumen.porcentajeActivos}%</p>
                    </div>
                    <TrendingUp size={48} className="text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Usuarios Activos */}
              <div className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <UserCheck className="mr-2 text-green-600" size={28} />
                    Usuarios Activos ({datos.usuariosActivos.length})
                  </h2>
                  <span className="badge bg-green-500 text-white text-lg px-4 py-2">
                    En línea
                  </span>
                </div>

                {datos.usuariosActivos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay usuarios activos en este momento
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Usuario</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Área</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Rol</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Hora Ingreso</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700">Ingresos Hoy</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.usuariosActivos.map((usuario) => (
                          <tr
                            key={usuario.id}
                            className="border-b border-gray-100 hover:bg-green-50 transition-colors animate-fade-in"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-800">{usuario.nombreCompleto}</p>
                                <p className="text-sm text-gray-600">{usuario.correo}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-700">{usuario.area}</td>
                            <td className="py-4 px-4">
                              <span className={`badge ${
                                usuario.rol === 'ceo' ? 'badge-ceo' : 'badge-user'
                              }`}>
                                {usuario.rol.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center text-gray-700">
                                <Clock size={16} className="mr-2 text-green-600" />
                                <span className="font-semibold">{usuario.horaIngreso}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 text-blue-800">
                                {usuario.totalIngresosHoy}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Activo
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Usuarios Inactivos */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <UserX className="mr-2 text-red-600" size={28} />
                    Usuarios Sin Ingresar ({datos.usuariosInactivos.length})
                  </h2>
                  <span className="badge bg-red-500 text-white text-lg px-4 py-2">
                    Fuera de línea
                  </span>
                </div>

                {datos.usuariosInactivos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ¡Todos los usuarios han ingresado! 🎉
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Usuario</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Área</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Rol</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700">Ingresos Hoy</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.usuariosInactivos.map((usuario) => (
                          <tr
                            key={usuario.id}
                            className="border-b border-gray-100 hover:bg-red-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-800">{usuario.nombreCompleto}</p>
                                <p className="text-sm text-gray-600">{usuario.correo}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-700">{usuario.area}</td>
                            <td className="py-4 px-4">
                              <span className={`badge ${
                                usuario.rol === 'ceo' ? 'badge-ceo' : 'badge-user'
                              }`}>
                                {usuario.rol.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {usuario.totalIngresosHoy > 0 ? (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-700">
                                  {usuario.totalIngresosHoy}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Sin ingresar
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TiempoReal;
