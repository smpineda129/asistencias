import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Save,
  Mail,
  Phone,
  Briefcase,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    celular: '',
    area: '',
    rol: 'user',
    password: '',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const response = await userAPI.obtenerTodos();
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual(null);
    setFormData({
      nombre: '',
      apellidos: '',
      correo: '',
      celular: '',
      area: '',
      rol: 'user',
      password: '',
      activo: true
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      celular: usuario.celular,
      area: usuario.area,
      rol: usuario.rol,
      password: '',
      activo: usuario.activo
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setUsuarioActual(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modoEdicion) {
        // Actualizar usuario
        const dataActualizar = { ...formData };
        if (!dataActualizar.password) {
          delete dataActualizar.password; // No actualizar password si está vacío
        }
        
        await userAPI.actualizar(usuarioActual._id, dataActualizar);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          toast.error('La contraseña es obligatoria');
          return;
        }
        
        await userAPI.crear(formData);
        toast.success('Usuario creado exitosamente');
      }
      
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar usuario';
      toast.error(mensaje);
    }
  };

  const handleEliminar = async (usuario) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellidos}?`)) {
      return;
    }
    
    try {
      await userAPI.eliminar(usuario._id);
      toast.success('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(mensaje);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const termino = busqueda.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(termino) ||
      usuario.apellidos.toLowerCase().includes(termino) ||
      usuario.correo.toLowerCase().includes(termino) ||
      usuario.area.toLowerCase().includes(termino)
    );
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-accent-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              👥 Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra los usuarios del sistema
            </p>
          </div>

          {/* Barra de acciones */}
          <div className="card mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Búsqueda */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o área..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Botón nuevo usuario */}
              <button
                onClick={abrirModalNuevo}
                className="btn-primary w-full md:w-auto"
              >
                <UserPlus className="mr-2" size={20} />
                Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Lista de Usuarios
              </h2>
              <span className="text-gray-600">
                Total: <span className="font-bold text-primary">{usuariosFiltrados.length}</span>
              </span>
            </div>

            {cargando ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header rounded-tl-xl">Nombre</th>
                      <th className="table-header">Correo</th>
                      <th className="table-header">Celular</th>
                      <th className="table-header">Área</th>
                      <th className="table-header">Rol</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header rounded-tr-xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      usuariosFiltrados.map((usuario) => (
                        <tr 
                          key={usuario._id}
                          className="hover:bg-accent transition-colors duration-200"
                        >
                          <td className="table-cell font-semibold">
                            {usuario.nombre} {usuario.apellidos}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <Mail size={16} className="text-primary mr-2" />
                              {usuario.correo}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <Phone size={16} className="text-secondary mr-2" />
                              {usuario.celular}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <Briefcase size={16} className="text-gray-500 mr-2" />
                              {usuario.area}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              usuario.rol === 'admin' ? 'badge-admin' :
                              usuario.rol === 'ceo' ? 'badge-ceo' :
                              'badge-user'
                            }`}>
                              <Shield size={14} className="mr-1" />
                              {usuario.rol.toUpperCase()}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              usuario.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex gap-2">
                              <button
                                onClick={() => abrirModalEditar(usuario)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminar(usuario)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de crear/editar usuario */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-light text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {modoEdicion ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="label-field">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Apellidos */}
                <div>
                  <label className="label-field">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="label-field">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="label-field">Celular *</label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="label-field">Área *</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: Recursos Humanos"
                    required
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="label-field">Rol *</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="user">Usuario</option>
                    <option value="ceo">CEO</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div className="md:col-span-2">
                  <label className="label-field">
                    Contraseña {!modoEdicion && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={modoEdicion ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                    required={!modoEdicion}
                    minLength={6}
                  />
                  {modoEdicion && (
                    <p className="text-sm text-gray-500 mt-1">
                      Dejar vacío si no deseas cambiar la contraseña
                    </p>
                  )}
                </div>

                {/* Estado activo */}
                <div className="md:col-span-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-2"
                    />
                    <span className="label-field mb-0">Usuario Activo</span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  <Save className="mr-2" size={20} />
                  {modoEdicion ? 'Actualizar' : 'Crear Usuario'}
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="btn-outline flex-1"
                >
                  <X className="mr-2" size={20} />
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

export default Usuarios;
