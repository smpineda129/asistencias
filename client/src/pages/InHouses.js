import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, UserPlus, X, Eye, MapPin, Link as LinkIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import MapSelector from '../components/MapSelector';
import api from '../utils/api';

const InHouses = () => {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [inHouses, setInHouses] = useState([]);
  const [todosLosInHouses, setTodosLosInHouses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalUsuarios, setMostrarModalUsuarios] = useState(false);
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [inHouseSeleccionado, setInHouseSeleccionado] = useState(null);
  const [inHouseEditando, setInHouseEditando] = useState(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [usuariosParaEncargado, setUsuariosParaEncargado] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    encargado: '',
    ubicacion: {
      direccion: '',
      coordenadas: {
        lat: null,
        lng: null
      },
      radioPermitido: 100
    }
  });

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [areaRes, inHousesRes, usuariosRes] = await Promise.all([
        api.get(`/areas/${areaId}`),
        api.get(`/areas/${areaId}/inhouses`),
        api.get(`/users?area=${areaId}`)
      ]);
      
      console.log('📊 Respuesta del servidor:', {
        area: areaRes.data,
        inHouses: inHousesRes.data,
        usuarios: usuariosRes.data
      });
      
      setArea(areaRes.data.area);
      setInHouses(inHousesRes.data.inHouses || []);
      setUsuariosParaEncargado(usuariosRes.data.usuarios || []);
      
      console.log('✅ InHouses cargados:', inHousesRes.data.inHouses?.length || 0);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      console.error('Detalles:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar coordenadas
    if (!formData.ubicacion.coordenadas.lat || !formData.ubicacion.coordenadas.lng) {
      toast.error('Debes seleccionar una ubicación en el mapa');
      return;
    }
    
    try {
      const data = { 
        ...formData, 
        areas: [areaId] // Enviar como array para compatibilidad con el nuevo modelo
      };
      if (inHouseEditando) {
        await api.put(`/inhouses/${inHouseEditando._id}`, data);
        toast.success('In House actualizado');
      } else {
        await api.post('/inhouses', data);
        toast.success('In House creado');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este In House?')) return;
    try {
      await api.delete(`/inhouses/${id}`);
      toast.success('In House eliminado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleAsignarUsuario = async (usuarioId) => {
    try {
      await api.post(`/inhouses/${inHouseSeleccionado._id}/usuarios`, { usuarioId });
      toast.success('Usuario asignado');
      cargarDatos();
      setMostrarModalUsuarios(false);
    } catch (error) {
      console.error('Error al asignar usuario:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al asignar usuario');
    }
  };

  const handleRemoverUsuario = async (usuarioId) => {
    if (!window.confirm('¿Remover este usuario?')) return;
    try {
      await api.delete(`/inhouses/${inHouseSeleccionado._id}/usuarios/${usuarioId}`);
      toast.success('Usuario removido');
      cargarDatos();
    } catch (error) {
      toast.error('Error al remover');
    }
  };

  const abrirModal = (inHouse = null) => {
    if (inHouse) {
      setInHouseEditando(inHouse);
      setFormData({
        nombre: inHouse.nombre,
        encargado: inHouse.encargado?._id || inHouse.encargado || '',
        ubicacion: {
          direccion: inHouse.ubicacion?.direccion || '',
          coordenadas: {
            lat: inHouse.ubicacion?.coordenadas?.lat || null,
            lng: inHouse.ubicacion?.coordenadas?.lng || null
          },
          radioPermitido: inHouse.ubicacion?.radioPermitido || 100
        }
      });
    } else {
      setInHouseEditando(null);
      setFormData({
        nombre: '',
        encargado: '',
        ubicacion: {
          direccion: '',
          coordenadas: {
            lat: null,
            lng: null
          },
          radioPermitido: 100
        }
      });
    }
    setMostrarModal(true);
  };

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        coordenadas: { lat, lng }
      }
    }));
  };

  const handleDireccionChange = (direccion) => {
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        direccion
      }
    }));
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setInHouseEditando(null);
  };

  const abrirModalUsuarios = async (inHouse) => {
    setInHouseSeleccionado(inHouse);
    
    // Cargar usuarios de TODAS las áreas del InHouse
    try {
      const areasIds = inHouse.areas?.map(a => a._id) || [];
      
      if (areasIds.length === 0) {
        setUsuariosDisponibles([]);
        setMostrarModalUsuarios(true);
        return;
      }
      
      // Obtener usuarios de todas las áreas del InHouse
      const usuariosPromises = areasIds.map(areaId => 
        api.get(`/users?area=${areaId}`)
      );
      
      const responses = await Promise.all(usuariosPromises);
      
      // Combinar usuarios de todas las áreas y eliminar duplicados
      const todosUsuarios = responses.flatMap(res => res.data.usuarios || []);
      const usuariosUnicos = todosUsuarios.filter((usuario, index, self) =>
        index === self.findIndex(u => u._id === usuario._id)
      );
      
      setUsuariosDisponibles(usuariosUnicos);
      setMostrarModalUsuarios(true);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios disponibles');
      setUsuariosDisponibles([]);
      setMostrarModalUsuarios(true);
    }
  };

  const abrirModalDetalles = (inHouse) => {
    setInHouseSeleccionado(inHouse);
    setMostrarModalDetalles(true);
  };

  const abrirModalAsignar = async () => {
    try {
      // Cargar todos los InHouses
      const response = await api.get('/inhouses');
      const todos = response.data.inHouses || [];
      
      // Filtrar los que NO están en esta área
      const inHousesDisponibles = todos.filter(ih => 
        !ih.areas?.some(a => a._id === areaId)
      );
      
      setTodosLosInHouses(inHousesDisponibles);
      setMostrarModalAsignar(true);
    } catch (error) {
      console.error('Error al cargar InHouses:', error);
      toast.error('Error al cargar InHouses disponibles');
    }
  };

  const handleAsignarInHouseExistente = async (inHouseId) => {
    try {
      // Obtener el InHouse actual
      const inHouseResponse = await api.get(`/inhouses/${inHouseId}`);
      const inHouse = inHouseResponse.data.inHouse;
      
      // Agregar esta área a sus áreas existentes
      const areasActualizadas = [...(inHouse.areas?.map(a => a._id) || []), areaId];
      
      await api.put(`/inhouses/${inHouseId}`, {
        areas: areasActualizadas
      });
      
      toast.success('In House asignado al área exitosamente');
      setMostrarModalAsignar(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al asignar InHouse:', error);
      toast.error(error.response?.data?.message || 'Error al asignar InHouse');
    }
  };

  const handleDesasignarArea = async (inHouseId) => {
    if (!window.confirm('¿Desasociar este In House del área? Los usuarios asignados no se verán afectados.')) return;
    
    try {
      const inHouseResponse = await api.get(`/inhouses/${inHouseId}`);
      const inHouse = inHouseResponse.data.inHouse;
      
      // Remover esta área de sus áreas
      const areasActualizadas = (inHouse.areas?.map(a => a._id) || []).filter(id => id !== areaId);
      
      if (areasActualizadas.length === 0) {
        toast.error('No se puede desasignar: el InHouse debe tener al menos un área');
        return;
      }
      
      await api.put(`/inhouses/${inHouseId}`, {
        areas: areasActualizadas
      });
      
      toast.success('In House desasignado del área');
      cargarDatos();
    } catch (error) {
      console.error('Error al desasignar InHouse:', error);
      toast.error(error.response?.data?.message || 'Error al desasignar InHouse');
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
            <button
              onClick={() => navigate('/areas')}
              className="text-primary hover:underline mb-4"
            >
              ← Volver a Áreas
            </button>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  🏢 {area?.nombre}
                </h1>
                <p className="text-gray-600">{area?.descripcion}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {area?.codigo}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={abrirModalAsignar}
                  className="btn-outline flex items-center"
                >
                  <LinkIcon size={20} className="mr-2" />
                  Asignar Existente
                </button>
                <button
                  onClick={() => abrirModal()}
                  className="btn-primary flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Nuevo In House
                </button>
              </div>
            </div>
          </div>

          {/* Grid de In Houses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inHouses.map((inHouse) => (
              <div key={inHouse._id} className="card hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Briefcase className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{inHouse.nombre}</h3>
                      <span className="text-sm text-gray-500">
                        {inHouse.encargado?.nombre} {inHouse.encargado?.apellidos}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(inHouse)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Editar"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    {inHouse.areas?.length > 1 ? (
                      <button
                        onClick={() => handleDesasignarArea(inHouse._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Desasignar de esta área"
                      >
                        <X size={18} className="text-orange-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEliminar(inHouse._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Encargado:</span>{' '}
                    {inHouse.encargado?.nombre} {inHouse.encargado?.apellidos}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Correo:</span> {inHouse.encargado?.correo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Usuarios asignados:</span>{' '}
                    {inHouse.usuariosAsignados?.length || 0}
                  </p>
                  {inHouse.areas?.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                        En {inHouse.areas.length} áreas
                      </span>
                    </div>
                  )}
                  {inHouse.ubicacion?.direccion && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{inHouse.ubicacion.direccion}</span>
                    </div>
                  )}
                  {inHouse.ubicacion?.radioPermitido && (
                    <p className="text-xs text-gray-500">
                      Radio: {inHouse.ubicacion.radioPermitido}m
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalDetalles(inHouse)}
                    className="flex-1 btn-outline flex items-center justify-center text-sm"
                  >
                    <Eye size={16} className="mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => abrirModalUsuarios(inHouse)}
                    className="flex-1 btn-primary flex items-center justify-center text-sm"
                  >
                    <UserPlus size={16} className="mr-1" />
                    Usuarios
                  </button>
                </div>
              </div>
            ))}
          </div>

          {inHouses.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay In Houses en esta área</p>
              <button onClick={() => abrirModal()} className="btn-primary mt-4">
                Crear Primer In House
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white p-6 border-b z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {inHouseEditando ? 'Editar' : 'Nuevo'} In House
                </h2>
                <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">Encargado del InHouse *</label>
                    <select
                      value={formData.encargado}
                      onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona un usuario</option>
                      {usuariosParaEncargado.map((usuario) => (
                        <option key={usuario._id} value={usuario._id}>
                          {usuario.nombre} {usuario.apellidos} - {usuario.correo}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      El encargado podrá ver el tiempo real y estadísticas de los usuarios asignados a este InHouse
                    </p>
                  </div>
                </div>

                {/* Radio permitido */}
                <div>
                  <label className="label-field">Radio permitido (metros)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.ubicacion.radioPermitido}
                    onChange={(e) => setFormData({
                      ...formData,
                      ubicacion: { ...formData.ubicacion, radioPermitido: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Distancia máxima permitida para marcar asistencia (default: 100m)
                  </p>
                </div>

                {/* Dirección */}
                <div>
                  <label className="label-field">Dirección</label>
                  <input
                    type="text"
                    value={formData.ubicacion.direccion}
                    onChange={(e) => handleDireccionChange(e.target.value)}
                    className="input-field"
                    placeholder="Se completará automáticamente al seleccionar en el mapa"
                  />
                </div>

                {/* Mapa */}
                <div>
                  <label className="label-field">Ubicación en el mapa *</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <MapSelector
                      lat={formData.ubicacion.coordenadas.lat}
                      lng={formData.ubicacion.coordenadas.lng}
                      onLocationChange={handleLocationChange}
                      direccion={formData.ubicacion.direccion}
                      onDireccionChange={handleDireccionChange}
                      radioPermitido={formData.ubicacion.radioPermitido}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                <button type="button" onClick={cerrarModal} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {inHouseEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestionar Usuarios */}
      {mostrarModalUsuarios && inHouseSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Usuarios de {inHouseSeleccionado.nombre}
              </h2>
              <button onClick={() => setMostrarModalUsuarios(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Usuarios Asignados</h3>
              <div className="space-y-2 mb-6">
                {inHouseSeleccionado.usuariosAsignados?.map((usuario) => (
                  <div key={usuario._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{usuario.nombre} {usuario.apellidos}</p>
                      <p className="text-sm text-gray-600">{usuario.correo}</p>
                    </div>
                    <button
                      onClick={() => handleRemoverUsuario(usuario._id)}
                      className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {(!inHouseSeleccionado.usuariosAsignados || inHouseSeleccionado.usuariosAsignados.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No hay usuarios asignados</p>
                )}
              </div>

              <h3 className="font-bold text-lg mb-4">
                Usuarios Disponibles ({usuariosDisponibles.length} total)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Usuarios de las áreas: {inHouseSeleccionado.areas?.map(a => a.nombre).join(', ')}
              </p>
              <div className="space-y-2">
                {usuariosDisponibles
                  .filter(u => !inHouseSeleccionado.usuariosAsignados?.some(ua => ua._id === u._id))
                  .map((usuario) => (
                    <div key={usuario._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{usuario.nombre} {usuario.apellidos}</p>
                        <p className="text-sm text-gray-600">{usuario.correo}</p>
                        {usuario.area && (
                          <span className="text-xs text-gray-500">
                            Área: {usuario.area.nombre || usuario.area}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAsignarUsuario(usuario._id)}
                        className="btn-primary"
                      >
                        Asignar
                      </button>
                    </div>
                  ))}
                {usuariosDisponibles.filter(u => !inHouseSeleccionado.usuariosAsignados?.some(ua => ua._id === u._id)).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {usuariosDisponibles.length === 0 
                      ? 'No hay usuarios en las áreas asignadas' 
                      : 'Todos los usuarios ya están asignados'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles del InHouse */}
      {mostrarModalDetalles && inHouseSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{inHouseSeleccionado.nombre}</h2>
                  <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Activo
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setMostrarModalDetalles(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Encargado</p>
                  <p className="font-semibold text-gray-800">
                    {inHouseSeleccionado.encargado?.nombre} {inHouseSeleccionado.encargado?.apellidos}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Correo del Encargado</p>
                  <p className="font-semibold text-gray-800">{inHouseSeleccionado.encargado?.correo}</p>
                </div>
              </div>

              {/* Áreas asignadas */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Áreas asignadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {inHouseSeleccionado.areas?.map((area) => (
                    <span key={area._id} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                      {area.nombre}
                    </span>
                  ))}
                  {(!inHouseSeleccionado.areas || inHouseSeleccionado.areas.length === 0) && (
                    <p className="text-gray-500">Sin áreas asignadas</p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {inHouseSeleccionado.ubicacion && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-green-600" />
                    Ubicación
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {inHouseSeleccionado.ubicacion.direccion && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Dirección:</span> {inHouseSeleccionado.ubicacion.direccion}
                      </p>
                    )}
                    {inHouseSeleccionado.ubicacion.coordenadas && (
                      <p className="text-gray-600 text-sm">
                        <span className="font-semibold">Coordenadas:</span>{' '}
                        {inHouseSeleccionado.ubicacion.coordenadas.coordinates 
                          ? `${inHouseSeleccionado.ubicacion.coordenadas.coordinates[1]?.toFixed(6)}, ${inHouseSeleccionado.ubicacion.coordenadas.coordinates[0]?.toFixed(6)}`
                          : `${inHouseSeleccionado.ubicacion.coordenadas.lat?.toFixed(6)}, ${inHouseSeleccionado.ubicacion.coordenadas.lng?.toFixed(6)}`
                        }
                      </p>
                    )}
                    {inHouseSeleccionado.ubicacion.radioPermitido && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          Radio permitido: <span className="font-semibold">{inHouseSeleccionado.ubicacion.radioPermitido}m</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Usuarios asignados */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <UserPlus size={20} className="text-purple-600" />
                  Usuarios asignados
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-gray-800">
                    {inHouseSeleccionado.usuariosAsignados?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {inHouseSeleccionado.usuariosAsignados?.length === 1 ? 'usuario' : 'usuarios'} asignado{inHouseSeleccionado.usuariosAsignados?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setMostrarModalDetalles(false);
                    abrirModal(inHouseSeleccionado);
                  }}
                  className="flex-1 btn-outline flex items-center justify-center"
                >
                  <Edit size={18} className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setMostrarModalDetalles(false);
                    abrirModalUsuarios(inHouseSeleccionado);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <UserPlus size={18} className="mr-2" />
                  Gestionar Usuarios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar InHouse Existente */}
      {mostrarModalAsignar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Asignar In House Existente</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecciona un In House para asociarlo al área {area?.nombre}
                </p>
              </div>
              <button onClick={() => setMostrarModalAsignar(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {todosLosInHouses.length > 0 ? (
                <div className="space-y-3">
                  {todosLosInHouses.map((inHouse) => (
                    <div key={inHouse._id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase size={20} className="text-blue-600" />
                          <h3 className="font-bold text-lg">{inHouse.nombre}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 ml-8">
                          <p>
                            <span className="font-semibold">Encargado:</span>{' '}
                            {inHouse.encargado?.nombre} {inHouse.encargado?.apellidos}
                          </p>
                          <p>
                            <span className="font-semibold">Correo:</span>{' '}
                            {inHouse.encargado?.correo}
                          </p>
                          {inHouse.areas?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs text-gray-500">Áreas actuales:</span>
                              {inHouse.areas.map((area) => (
                                <span key={area._id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {area.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                          {inHouse.ubicacion?.direccion && (
                            <div className="flex items-start gap-2 mt-2">
                              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                              <span className="text-xs">{inHouse.ubicacion.direccion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAsignarInHouseExistente(inHouse._id)}
                        className="btn-primary ml-4"
                      >
                        <LinkIcon size={16} className="mr-2" />
                        Asignar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg mb-2">
                    No hay In Houses disponibles para asignar
                  </p>
                  <p className="text-gray-500 text-sm">
                    Todos los In Houses existentes ya están asociados a esta área
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InHouses;
