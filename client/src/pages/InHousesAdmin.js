import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, MapPin, Users, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import MapSelector from '../components/MapSelector';
import api from '../utils/api';

const InHousesAdmin = () => {
  const navigate = useNavigate();
  const [inHouses, setInHouses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [inHouseEditando, setInHouseEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    areas: [],
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
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [inHousesRes, areasRes, usuariosRes] = await Promise.all([
        api.get('/inhouses'),
        api.get('/areas'),
        api.get('/users?activo=true')
      ]);
      setInHouses(inHousesRes.data.inHouses || []);
      setAreas(areasRes.data.areas || []);
      setUsuarios(usuariosRes.data.usuarios || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.ubicacion.coordenadas.lat || !formData.ubicacion.coordenadas.lng) {
      toast.error('Debes seleccionar una ubicación en el mapa');
      return;
    }

    if (formData.areas.length === 0) {
      toast.error('Debes seleccionar al menos un área');
      return;
    }

    try {
      if (inHouseEditando) {
        await api.put(`/inhouses/${inHouseEditando._id}`, formData);
        toast.success('In House actualizado');
      } else {
        await api.post('/inhouses', formData);
        toast.success('In House creado');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este In House? Se removerá de todos los usuarios asignados.')) return;
    try {
      await api.delete(`/inhouses/${id}`);
      toast.success('In House eliminado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const abrirModal = (inHouse = null) => {
    if (inHouse) {
      setInHouseEditando(inHouse);
      
      // Convertir coordenadas GeoJSON a formato lat/lng si es necesario
      let lat = null;
      let lng = null;
      if (inHouse.ubicacion?.coordenadas) {
        if (inHouse.ubicacion.coordenadas.coordinates) {
          // Formato GeoJSON: [lng, lat]
          [lng, lat] = inHouse.ubicacion.coordenadas.coordinates;
        } else if (inHouse.ubicacion.coordenadas.lat && inHouse.ubicacion.coordenadas.lng) {
          // Formato antiguo: {lat, lng}
          lat = inHouse.ubicacion.coordenadas.lat;
          lng = inHouse.ubicacion.coordenadas.lng;
        }
      }
      
      setFormData({
        nombre: inHouse.nombre,
        areas: inHouse.areas?.map(a => a._id) || [],
        encargado: inHouse.encargado?._id || inHouse.encargado || '',
        ubicacion: {
          direccion: inHouse.ubicacion?.direccion || '',
          coordenadas: { lat, lng },
          radioPermitido: inHouse.ubicacion?.radioPermitido || 100
        }
      });
    } else {
      setInHouseEditando(null);
      setFormData({
        nombre: '',
        areas: [],
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

  const cerrarModal = () => {
    setMostrarModal(false);
    setInHouseEditando(null);
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

  const toggleArea = (areaId) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(areaId)
        ? prev.areas.filter(id => id !== areaId)
        : [...prev.areas, areaId]
    }));
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="text-primary" size={32} />
                Gestión de In Houses
              </h1>
              <p className="text-gray-600 mt-2">
                Administra las empresas in-house con geolocalización
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-lg"
            >
              <Plus size={20} />
              Nuevo In House
            </button>
          </div>

          {/* Lista de In Houses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inHouses.map((inHouse) => (
              <div key={inHouse._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{inHouse.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Encargado:</strong> {inHouse.encargado?.nombre} {inHouse.encargado?.apellidos}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Correo:</strong> {inHouse.encargado?.correo}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    inHouse.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {inHouse.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Áreas */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Áreas asignadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {inHouse.areas?.map((area) => (
                      <span key={area._id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {area.nombre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ubicación */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        {inHouse.ubicacion?.direccion || 'Sin dirección'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Radio: {inHouse.ubicacion?.radioPermitido || 100}m
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usuarios */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{inHouse.usuariosAsignados?.length || 0} usuarios asignados</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/inhouses/${inHouse._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() => abrirModal(inHouse)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(inHouse._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {inHouses.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No hay In Houses registrados</p>
              <p className="text-gray-500 mt-2">Crea el primero haciendo clic en "Nuevo In House"</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {inHouseEditando ? 'Editar In House' : 'Nuevo In House'}
              </h2>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Encargado del InHouse *
                  </label>
                  <select
                    required
                    value={formData.encargado}
                    onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
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

              {/* Áreas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Áreas asignadas * (selecciona una o más)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                  {areas.map((area) => (
                    <label key={area._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.areas.includes(area._id)}
                        onChange={() => toggleArea(area._id)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{area.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Radio permitido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio permitido (metros)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.ubicacion.radioPermitido}
                  onChange={(e) => setFormData({
                    ...formData,
                    ubicacion: { ...formData.ubicacion, radioPermitido: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.ubicacion.direccion}
                  onChange={(e) => handleDireccionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Se completará automáticamente al seleccionar en el mapa"
                />
              </div>

              {/* Mapa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación en el mapa *
                </label>
                <MapSelector
                  lat={formData.ubicacion.coordenadas.lat}
                  lng={formData.ubicacion.coordenadas.lng}
                  onLocationChange={handleLocationChange}
                  direccion={formData.ubicacion.direccion}
                  onDireccionChange={handleDireccionChange}
                  radioPermitido={formData.ubicacion.radioPermitido}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {inHouseEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InHousesAdmin;
