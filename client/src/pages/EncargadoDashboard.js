import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, TrendingUp, Briefcase, CheckCircle, XCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const EncargadoDashboard = () => {
  const { usuario } = useAuth();
  const [inHouse, setInHouse] = useState(null);
  const [usuariosConAsistencia, setUsuariosConAsistencia] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    usuariosAsignados: 0,
    usuariosActivos: 0,
    asistenciasHoy: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      console.log('Usuario:', usuario);
      console.log('InHouse Encargado ID:', usuario.inHouseEncargado);
      
      // Obtener el InHouse del encargado
      if (!usuario.inHouseEncargado) {
        toast.error('No tienes un InHouse asignado. Contacta al administrador.');
        setCargando(false);
        return;
      }
      
      if (usuario.inHouseEncargado) {
        console.log('Obteniendo InHouse:', usuario.inHouseEncargado);
        const inHouseRes = await api.get(`/inhouses/${usuario.inHouseEncargado}`);
        console.log('Respuesta InHouse:', inHouseRes.data);
        const inHouseData = inHouseRes.data.inHouse;
        setInHouse(inHouseData);
        
        // Obtener asistencias de hoy de los usuarios del InHouse
        const hoy = new Date().toISOString().split('T')[0];
        const usuariosIds = inHouseData.usuariosAsignados?.map(u => u._id || u) || [];
        
        let asistenciasHoy = 0;
        let usuariosActivos = 0;
        
        if (usuariosIds.length > 0) {
          try {
            // Obtener asistencias de hoy
            const asistenciasRes = await api.get(`/attendance?fecha=${hoy}`);
            const asistencias = asistenciasRes.data.asistencias || [];
            console.log('Todas las asistencias de hoy:', asistencias);
            console.log('IDs de usuarios del InHouse:', usuariosIds);
            
            // Filtrar asistencias de usuarios del InHouse
            const asistenciasInHouse = asistencias.filter(a => {
              const usuarioId = a.usuario?._id || a.usuario;
              const perteneceAlInHouse = usuariosIds.some(id => 
                id.toString() === usuarioId.toString()
              );
              console.log(`Asistencia de ${usuarioId}: pertenece=${perteneceAlInHouse}`);
              return perteneceAlInHouse;
            });
            
            console.log('Asistencias del InHouse:', asistenciasInHouse);
            asistenciasHoy = asistenciasInHouse.length;
            
            // Contar usuarios que marcaron entrada hoy
            const usuariosConEntrada = new Set(
              asistenciasInHouse
                .filter(a => a.tipo === 'entrada')
                .map(a => a.usuario._id || a.usuario)
            );
            usuariosActivos = usuariosConEntrada.size;
            
            // Crear mapa de usuarios con sus asistencias
            const usuariosMap = {};
            inHouseData.usuariosAsignados?.forEach(u => {
              // Si u es un objeto con _id, usarlo; si es solo un ID, crear objeto básico
              const userId = typeof u === 'object' ? (u._id || u) : u;
              const usuarioObj = typeof u === 'object' ? u : { _id: userId };
              
              usuariosMap[userId] = {
                ...usuarioObj,
                asistencias: asistenciasInHouse.filter(a => 
                  (a.usuario._id || a.usuario).toString() === userId.toString()
                ),
                tieneEntrada: usuariosConEntrada.has(userId.toString())
              };
            });
            
            setUsuariosConAsistencia(Object.values(usuariosMap));
          } catch (error) {
            console.error('Error al obtener asistencias:', error);
          }
        }
        
        setEstadisticas({
          usuariosAsignados: usuariosIds.length,
          usuariosActivos,
          asistenciasHoy
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar información del InHouse');
    } finally {
      setCargando(false);
    }
  };

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dashboard de Encargado
            </h1>
            <p className="text-gray-600">
              Gestiona tu InHouse: {inHouse?.nombre || 'Cargando...'}
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Usuarios Asignados</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.usuariosAsignados}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Activos Hoy</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.usuariosActivos}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Asistencias Hoy</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.asistenciasHoy}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Información del InHouse */}
          {inHouse && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{inHouse.nombre}</h2>
                  <p className="text-gray-600">InHouse bajo tu gestión</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                  <p className="text-gray-800">{inHouse.ubicacion?.direccion || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Radio Permitido</p>
                  <p className="text-gray-800">{inHouse.ubicacion?.radioPermitido || 100}m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Áreas Asociadas</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {inHouse.areas?.map((area) => (
                      <span key={area._id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {area.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de usuarios */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              Usuarios Asignados ({inHouse?.usuariosAsignados?.length || 0})
            </h2>
            
            {inHouse?.usuariosAsignados && inHouse.usuariosAsignados.length > 0 ? (
              <div className="space-y-3">
                {inHouse.usuariosAsignados.map((usuario) => {
                  const asistenciasUsuario = usuariosConAsistencia.find(u => u._id === usuario._id);
                  const tieneEntrada = asistenciasUsuario?.tieneEntrada || false;
                  const numAsistencias = asistenciasUsuario?.asistencias?.length || 0;
                  
                  return (
                    <div 
                      key={usuario._id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          tieneEntrada ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <User size={24} className={tieneEntrada ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {usuario.nombre} {usuario.apellidos}
                          </p>
                          <p className="text-sm text-gray-600">{usuario.correo}</p>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Asistencias hoy</p>
                          <p className="text-lg font-bold text-gray-800">{numAsistencias}</p>
                        </div>
                        
                        {tieneEntrada ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle size={16} />
                            <span className="text-sm font-semibold">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-600 rounded-full">
                            <XCircle size={16} />
                            <span className="text-sm font-semibold">Sin entrada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-2 opacity-50" />
                <p>No hay usuarios asignados a este InHouse</p>
              </div>
            )}
          </div>

          {/* Mensaje de bienvenida */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¡Bienvenido, {usuario.nombreCompleto}!
            </h3>
            <p className="text-gray-600">
              Como encargado de <strong>{inHouse?.nombre}</strong>, puedes ver el tiempo real y las estadísticas 
              de los usuarios asignados a tu InHouse. Usa el menú de navegación para acceder a las diferentes secciones.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncargadoDashboard;
