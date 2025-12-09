import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, TrendingUp, Briefcase, Building2, CheckCircle, XCircle, User, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const AdminAreaDashboard = () => {
  const { usuario } = useAuth();
  const [area, setArea] = useState(null);
  const [inHouses, setInHouses] = useState([]);
  const [usuariosArea, setUsuariosArea] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalInHouses: 0,
    asistenciasHoy: 0
  });
  const [cargando, setCargando] = useState(true);
  
  // Estados para modal de asignación de usuarios
  const [mostrarModalUsuarios, setMostrarModalUsuarios] = useState(false);
  const [inHouseSeleccionado, setInHouseSeleccionado] = useState(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Obtener área del usuario
      const areaId = usuario.area;
      if (!areaId) {
        toast.error('No tienes un área asignada');
        setCargando(false);
        return;
      }

      // Obtener información del área
      const areaRes = await api.get(`/areas/${areaId}`);
      const areaData = areaRes.data.area;
      setArea(areaData);

      // Obtener InHouses del área
      const inHousesRes = await api.get(`/areas/${areaId}/inhouses`);
      const inHousesData = inHousesRes.data.inHouses || [];
      setInHouses(inHousesData);

      // Obtener usuarios del área
      const usuariosRes = await api.get(`/users?area=${areaId}`);
      const usuariosData = usuariosRes.data.usuarios || [];
      setUsuariosArea(usuariosData);

      // Obtener asistencias de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const asistenciasRes = await api.get(`/attendance?fecha=${hoy}`);
      const todasAsistencias = asistenciasRes.data.asistencias || [];

      // Filtrar asistencias de usuarios del área
      const usuariosIds = usuariosData.map(u => u._id);
      const asistenciasArea = todasAsistencias.filter(a =>
        usuariosIds.includes(a.usuario?._id || a.usuario)
      );

      // Contar usuarios activos (que marcaron entrada hoy)
      const usuariosConEntrada = new Set(
        asistenciasArea
          .filter(a => a.tipo === 'entrada')
          .map(a => a.usuario?._id || a.usuario)
      );

      setEstadisticas({
        totalUsuarios: usuariosData.length,
        usuariosActivos: usuariosConEntrada.size,
        totalInHouses: inHousesData.length,
        asistenciasHoy: asistenciasArea.length
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar información del área');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalUsuarios = async (inHouse) => {
    setInHouseSeleccionado(inHouse);
    setUsuariosDisponibles(usuariosArea);
    
    // Pre-seleccionar usuarios ya asignados
    const usuariosAsignadosIds = inHouse.usuariosAsignados?.map(u => u._id || u) || [];
    setUsuariosSeleccionados(usuariosAsignadosIds);
    
    setMostrarModalUsuarios(true);
  };

  const toggleUsuario = (usuarioId) => {
    setUsuariosSeleccionados(prev => {
      if (prev.includes(usuarioId)) {
        return prev.filter(id => id !== usuarioId);
      } else {
        return [...prev, usuarioId];
      }
    });
  };

  const guardarAsignacionUsuarios = async () => {
    try {
      await api.put(`/inhouses/${inHouseSeleccionado._id}/asignar-usuarios`, {
        usuariosIds: usuariosSeleccionados
      });
      
      toast.success('Usuarios asignados exitosamente');
      setMostrarModalUsuarios(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al asignar usuarios:', error);
      toast.error(error.response?.data?.message || 'Error al asignar usuarios');
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
              Dashboard de Área
            </h1>
            <p className="text-gray-600">
              Gestiona tu área: <strong>{area?.nombre}</strong>
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.totalUsuarios}</p>
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
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Houses</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.totalInHouses}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Asistencias Hoy</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.asistenciasHoy}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Información del Área */}
          {area && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{area.nombre}</h2>
                  <p className="text-gray-600">{area.descripcion}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Código</p>
                  <p className="text-gray-800 font-semibold">{area.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Administrador</p>
                  <p className="text-gray-800 font-semibold">
                    {area.administrador?.nombre} {area.administrador?.apellidos}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid de InHouses y Usuarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* InHouses del Área */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={24} className="text-purple-600" />
                In Houses ({inHouses.length})
              </h2>
              
              {inHouses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inHouses.map((inHouse) => (
                    <div key={inHouse._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{inHouse.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Encargado: {inHouse.encargado?.nombre} {inHouse.encargado?.apellidos}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Usuarios</p>
                          <p className="text-lg font-bold text-gray-800">
                            {inHouse.usuariosAsignados?.length || 0}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => abrirModalUsuarios(inHouse)}
                        className="w-full btn-primary flex items-center justify-center text-sm py-2"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Gestionar Usuarios
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No hay In Houses en esta área</p>
                </div>
              )}
            </div>

            {/* Usuarios del Área */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Usuarios ({usuariosArea.length})
              </h2>
              
              {usuariosArea.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {usuariosArea.map((usuario) => (
                    <div key={usuario._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {usuario.nombre} {usuario.apellidos}
                          </p>
                          <p className="text-sm text-gray-600">{usuario.correo}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.activo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios en esta área</p>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¡Bienvenido, {usuario.nombreCompleto}!
            </h3>
            <p className="text-gray-600">
              Como administrador del área <strong>{area?.nombre}</strong>, puedes gestionar los usuarios, 
              InHouses y ver el tiempo real de asistencias de tu área. Usa el menú de navegación para acceder 
              a las diferentes secciones.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Gestionar Usuarios */}
      {mostrarModalUsuarios && inHouseSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestionar Usuarios</h2>
                <p className="text-gray-600 mt-1">
                  {inHouseSeleccionado.nombre}
                </p>
              </div>
              <button
                onClick={() => setMostrarModalUsuarios(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selecciona los usuarios que trabajarán en este In House. 
                  Solo se muestran usuarios del área <strong>{area?.nombre}</strong>.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {usuariosSeleccionados.length} usuario(s) seleccionado(s)
                </p>
              </div>

              {usuariosDisponibles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios disponibles en esta área</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usuariosDisponibles.map((usuario) => {
                    const estaSeleccionado = usuariosSeleccionados.includes(usuario._id);
                    return (
                      <div
                        key={usuario._id}
                        onClick={() => toggleUsuario(usuario._id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          estaSeleccionado
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              estaSeleccionado
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                            }`}>
                              {estaSeleccionado && (
                                <CheckCircle size={16} className="text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {usuario.nombre} {usuario.apellidos}
                              </p>
                              <p className="text-sm text-gray-600">{usuario.correo}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            usuario.rol === 'admin_area' ? 'bg-purple-100 text-purple-800' :
                            usuario.rol === 'encargado_inhouse' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {usuario.rol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setMostrarModalUsuarios(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={guardarAsignacionUsuarios}
                className="flex-1 btn-primary"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAreaDashboard;
