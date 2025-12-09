import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, User, MapPin, Calendar, RefreshCw, LogIn, LogOut as LogOutIcon, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const EncargadoTiempoReal = () => {
  const { usuario } = useAuth();
  const [asistencias, setAsistencias] = useState([]);
  const [inHouse, setInHouse] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const intervalo = setInterval(cargarDatos, 30000);
    return () => clearInterval(intervalo);
  }, []); // Actualizar cada 30 segundos

  const cargarDatos = async () => {
    try {
      if (!usuario.inHouseEncargado) {
        toast.error('No tienes un InHouse asignado');
        setCargando(false);
        return;
      }

      // Obtener InHouse
      const inHouseRes = await api.get(`/inhouses/${usuario.inHouseEncargado}`);
      const inHouseData = inHouseRes.data.inHouse;
      setInHouse(inHouseData);

      // Obtener asistencias de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const asistenciasRes = await api.get(`/attendance?fecha=${hoy}`);
      const todasAsistencias = asistenciasRes.data.asistencias || [];

      // Filtrar solo asistencias de usuarios del InHouse
      const usuariosIds = inHouseData.usuariosAsignados?.map(u => u._id || u) || [];
      const asistenciasFiltradas = todasAsistencias.filter(a =>
        usuariosIds.includes(a.usuario?._id || a.usuario)
      );

      // Ordenar por hora más reciente
      asistenciasFiltradas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAsistencias(asistenciasFiltradas);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar asistencias');
    } finally {
      setCargando(false);
    }
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular estadísticas
  const entradas = asistencias.filter(a => a.tipo === 'entrada').length;
  const salidas = asistencias.filter(a => a.tipo === 'salida').length;
  const usuariosActivos = new Set(
    asistencias.filter(a => a.tipo === 'entrada').map(a => a.usuario?._id || a.usuario)
  ).size;

  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                ⏱️ Tiempo Real
              </h1>
              <p className="text-gray-600">
                Asistencias en tiempo real de <strong>{inHouse?.nombre}</strong>
              </p>
            </div>
            <button
              onClick={cargarDatos}
              className="btn-primary flex items-center"
            >
              <RefreshCw size={20} className="mr-2" />
              Actualizar
            </button>
          </div>

          {/* Info de actualización */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <span className="text-sm text-gray-700">
                  Última actualización: <strong>{formatearHora(ultimaActualizacion)}</strong>
                </span>
              </div>
              <span className="text-sm text-gray-600">
                🔄 Se actualiza automáticamente cada 30 segundos
              </span>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hoy</p>
                  <p className="text-3xl font-bold text-gray-800">{asistencias.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Entradas</p>
                  <p className="text-3xl font-bold text-green-600">{entradas}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <LogIn size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salidas</p>
                  <p className="text-3xl font-bold text-red-600">{salidas}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOutIcon size={24} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-purple-600">{usuariosActivos}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de asistencias */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock size={24} className="text-blue-600" />
                Registro de Asistencias ({asistencias.length})
              </h2>
            </div>

            {asistencias.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ubicación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {asistencias.map((asistencia) => (
                      <tr key={asistencia._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {asistencia.usuario?.nombre} {asistencia.usuario?.apellidos}
                              </p>
                              <p className="text-xs text-gray-500">{asistencia.usuario?.correo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asistencia.tipo === 'entrada' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <CheckCircle size={14} className="mr-1" />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <XCircle size={14} className="mr-1" />
                              Salida
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            {formatearHora(asistencia.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(asistencia.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asistencia.ubicacion ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin size={16} className="mr-1 text-green-500" />
                              <span className="text-xs">
                                {asistencia.ubicacion.lat?.toFixed(4)}, {asistencia.ubicacion.lng?.toFixed(4)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin ubicación</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No hay asistencias registradas hoy</p>
                <p className="text-gray-400 text-sm mt-2">
                  Las asistencias aparecerán aquí en tiempo real
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EncargadoTiempoReal;
