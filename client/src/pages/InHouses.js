import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, UserPlus, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const InHouses = () => {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [inHouses, setInHouses] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalUsuarios, setMostrarModalUsuarios] = useState(false);
  const [inHouseSeleccionado, setInHouseSeleccionado] = useState(null);
  const [inHouseEditando, setInHouseEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    encargado: '',
    correo: '',
    password: ''
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
      setArea(areaRes.data.area);
      setInHouses(inHousesRes.data.inHouses || []);
      setUsuarios(usuariosRes.data.usuarios || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, area: areaId };
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
        encargado: inHouse.encargado,
        correo: inHouse.correo,
        password: ''
      });
    } else {
      setInHouseEditando(null);
      setFormData({
        nombre: '',
        encargado: '',
        correo: '',
        password: ''
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setInHouseEditando(null);
  };

  const abrirModalUsuarios = (inHouse) => {
    setInHouseSeleccionado(inHouse);
    setMostrarModalUsuarios(true);
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
              <button
                onClick={() => abrirModal()}
                className="btn-primary flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Nuevo In House
              </button>
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
                      <span className="text-sm text-gray-500">{inHouse.encargado}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(inHouse)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEliminar(inHouse._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Correo:</span> {inHouse.correo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Usuarios asignados:</span>{' '}
                    {inHouse.usuariosAsignados?.length || 0}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalUsuarios(inHouse)}
                    className="flex-1 btn-outline flex items-center justify-center text-sm"
                  >
                    <UserPlus size={16} className="mr-1" />
                    Gestionar Usuarios
                  </button>
                  <button
                    onClick={() => navigate(`/inhouses/${inHouse._id}/tiempo-real`)}
                    className="flex-1 btn-primary flex items-center justify-center text-sm"
                  >
                    <Eye size={16} className="mr-1" />
                    Ver Tiempo Real
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {inHouseEditando ? 'Editar' : 'Nuevo'} In House
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="label-field">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Encargado</label>
                  <input
                    type="text"
                    value={formData.encargado}
                    onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Correo (Login)</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">
                    Contraseña {inHouseEditando && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!inHouseEditando}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {inHouseEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={cerrarModal} className="btn-outline flex-1">
                  Cancelar
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

              <h3 className="font-bold text-lg mb-4">Usuarios Disponibles</h3>
              <div className="space-y-2">
                {usuarios
                  .filter(u => !inHouseSeleccionado.usuariosAsignados?.some(ua => ua._id === u._id))
                  .map((usuario) => (
                    <div key={usuario._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{usuario.nombre} {usuario.apellidos}</p>
                        <p className="text-sm text-gray-600">{usuario.correo}</p>
                      </div>
                      <button
                        onClick={() => handleAsignarUsuario(usuario._id)}
                        className="btn-primary"
                      >
                        Asignar
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InHouses;
