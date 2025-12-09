import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [inHousesPorArea, setInHousesPorArea] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [areaEditando, setAreaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    administrador: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [areasRes, usuariosRes] = await Promise.all([
        api.get('/areas'),
        api.get('/users')
      ]);
      
      const areasData = areasRes.data.areas || [];
      setAreas(areasData);
      setUsuarios(usuariosRes.data.usuarios || []);
      
      // Cargar InHouses por cada área
      const inHousesCount = {};
      await Promise.all(
        areasData.map(async (area) => {
          try {
            const response = await api.get(`/areas/${area._id}/inhouses`);
            inHousesCount[area._id] = response.data.inHouses?.length || 0;
          } catch (error) {
            console.error(`Error al cargar InHouses del área ${area._id}:`, error);
            inHousesCount[area._id] = 0;
          }
        })
      );
      setInHousesPorArea(inHousesCount);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (areaEditando) {
        await api.put(`/areas/${areaEditando._id}`, formData);
        toast.success('Área actualizada exitosamente');
      } else {
        await api.post('/areas', formData);
        toast.success('Área creada exitosamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar área');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta área?')) return;
    
    try {
      await api.delete(`/areas/${id}`);
      toast.success('Área eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar área');
    }
  };

  const abrirModal = (area = null) => {
    if (area) {
      setAreaEditando(area);
      setFormData({
        nombre: area.nombre,
        descripcion: area.descripcion,
        codigo: area.codigo,
        administrador: area.administrador?._id || ''
      });
    } else {
      setAreaEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        codigo: '',
        administrador: ''
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAreaEditando(null);
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🏢 Gestión de Áreas
              </h1>
              <p className="text-gray-600">
                Administra las áreas y departamentos de la empresa
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nueva Área
            </button>
          </div>

          {/* Grid de Áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div key={area._id} className="card hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{area.nombre}</h3>
                      <span className="text-sm text-gray-500">{area.codigo}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(area)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEliminar(area._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{area.descripcion}</p>

                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users size={16} className="mr-2" />
                    <span className="font-semibold">Administrador:</span>
                  </div>
                  <p className="text-gray-800 ml-6">
                    {area.administrador?.nombre} {area.administrador?.apellidos}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase size={16} className="mr-2" />
                      <span className="font-semibold">In Houses:</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {inHousesPorArea[area._id] || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => window.location.href = `/areas/${area._id}/inhouses`}
                    className="w-full btn-outline flex items-center justify-center"
                  >
                    <Briefcase size={18} className="mr-2" />
                    Gestionar In Houses
                  </button>
                </div>
              </div>
            ))}
          </div>

          {areas.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay áreas registradas</p>
              <button
                onClick={() => abrirModal()}
                className="btn-primary mt-4"
              >
                Crear Primera Área
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {areaEditando ? 'Editar Área' : 'Nueva Área'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="label-field">Nombre del Área</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-field"
                    required
                    placeholder="Ej: Recursos Humanos"
                  />
                </div>

                <div>
                  <label className="label-field">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="input-field"
                    required
                    placeholder="Ej: RH-001"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="label-field">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="input-field"
                    required
                    rows={3}
                    placeholder="Describe las funciones del área..."
                  />
                </div>

                <div>
                  <label className="label-field">Administrador del Área</label>
                  <select
                    value={formData.administrador}
                    onChange={(e) => setFormData({ ...formData, administrador: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona un administrador</option>
                    {usuarios.filter(u => u.rol === 'admin_area').map((usuario) => (
                      <option key={usuario._id} value={usuario._id}>
                        {usuario.nombre} {usuario.apellidos} - {usuario.correo}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    El usuario seleccionado podrá gestionar esta área y sus In Houses
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {areaEditando ? 'Actualizar' : 'Crear'} Área
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="btn-outline flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Areas;
