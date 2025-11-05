import React, { useState, useEffect } from 'react';
import { Fingerprint, Plus, Trash2, CheckCircle, AlertCircle, Users, TrendingUp, Search } from 'lucide-react';
import { biometricAPI, userAPI } from '../utils/api';
import FingerprintEnrollment from '../components/FingerprintEnrollment';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const BiometricManagement = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, with-fingerprints, without-fingerprints

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        userAPI.obtenerTodos(),
        biometricAPI.obtenerEstadisticas()
      ]);

      // Arreglar: verificar la estructura de la respuesta
      const usersData = usersResponse.data.usuarios || usersResponse.data.data || [];
      
      const usersWithFingerprints = await Promise.all(
        usersData.map(async (user) => {
          try {
            const fingerprintsResponse = await biometricAPI.obtenerHuellasUsuario(user._id);
            return {
              ...user,
              huellas: fingerprintsResponse.data.data || []
            };
          } catch (error) {
            return {
              ...user,
              huellas: []
            };
          }
        })
      );

      setUsuarios(usersWithFingerprints);
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos biométricos');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (user) => {
    setSelectedUser(user);
    setShowEnrollment(true);
  };

  const handleEnrollmentSuccess = () => {
    setShowEnrollment(false);
    setSelectedUser(null);
    loadData();
  };

  const handleDeleteFingerprint = async (fingerprintId) => {
    if (!window.confirm('¿Está seguro de eliminar esta huella?')) return;

    try {
      await biometricAPI.eliminarHuella(fingerprintId);
      toast.success('Huella eliminada exitosamente');
      loadData();
    } catch (error) {
      console.error('Error al eliminar huella:', error);
      toast.error('Error al eliminar huella');
    }
  };

  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'with-fingerprints') {
      return matchesSearch && user.huellas.length > 0;
    } else if (filterStatus === 'without-fingerprints') {
      return matchesSearch && user.huellas.length === 0;
    }

    return matchesSearch;
  });

  const getDedoLabel = (dedo) => {
    const labels = {
      'pulgar_derecho': 'Pulgar Der.',
      'indice_derecho': 'Índice Der.',
      'medio_derecho': 'Medio Der.',
      'anular_derecho': 'Anular Der.',
      'menique_derecho': 'Meñique Der.',
      'pulgar_izquierdo': 'Pulgar Izq.',
      'indice_izquierdo': 'Índice Izq.',
      'medio_izquierdo': 'Medio Izq.',
      'anular_izquierdo': 'Anular Izq.',
      'menique_izquierdo': 'Meñique Izq.'
    };
    return labels[dedo] || dedo;
  };

  if (showEnrollment && selectedUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <FingerprintEnrollment
              usuario={selectedUser}
              onSuccess={handleEnrollmentSuccess}
              onCancel={() => {
                setShowEnrollment(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Fingerprint className="w-8 h-8 text-primary" />
              Gestión de Huellas Dactilares
            </h1>
            <p className="text-gray-600">
              Administre las huellas dactilares de los usuarios del sistema
            </p>
          </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Huellas</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.resumen.totalHuellas}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Fingerprint className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios con Huella</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.resumen.usuariosConHuella}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.resumen.totalUsuarios}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cobertura</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.resumen.porcentajeCobertura}%
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los usuarios</option>
              <option value="with-fingerprints">Con huellas registradas</option>
              <option value="without-fingerprints">Sin huellas registradas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Huellas Registradas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.nombre.charAt(0)}{user.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nombre} {user.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.correo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.area?.nombre || 'Sin área'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.huellas.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Configurado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.huellas.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {user.huellas.map((huella) => (
                              <div
                                key={huella.id}
                                className="group relative inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs"
                              >
                                <Fingerprint className="w-3 h-3 text-blue-600" />
                                <span className="text-blue-700">
                                  {getDedoLabel(huella.dedo)}
                                </span>
                                <button
                                  onClick={() => handleDeleteFingerprint(huella.id)}
                                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600 hover:text-red-700" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin huellas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEnrollClick(user)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Registrar Huella
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default BiometricManagement;
