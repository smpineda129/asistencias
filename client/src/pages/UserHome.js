import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../utils/api';
import { CheckCircle, Calendar, Clock, TrendingUp, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/Navbar';

const UserHome = () => {
  const { usuario } = useAuth();
  const [misAsistencias, setMisAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [asistenciaActiva, setAsistenciaActiva] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [inHouses, setInHouses] = useState([]);
  const [inHouseSeleccionado, setInHouseSeleccionado] = useState('');
  const [mostrarSelectorInHouse, setMostrarSelectorInHouse] = useState(false);

  useEffect(() => {
    if (usuario) {
      cargarMisAsistencias();
      cargarAsistenciaActiva();
      cargarInHouses();
    }
  }, [usuario]);

  const cargarInHouses = async () => {
    try {
      // Cargar In Houses asignados al usuario
      const response = await attendanceAPI.get(`/users/${usuario.id}`);
      setInHouses(response.data.usuario.inHousesAsignados || []);
    } catch (error) {
      console.error('Error al cargar In Houses:', error);
    }
  };

  const cargarMisAsistencias = async () => {
    try {
      setCargando(true);
      const response = await attendanceAPI.obtenerPorUsuario(usuario.id, { limite: 10 });
      setMisAsistencias(response.data.asistencias || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarAsistenciaActiva = async () => {
    try {
      const response = await attendanceAPI.obtenerAsistenciaActiva();
      setAsistenciaActiva(response.data.asistenciaActiva);
    } catch (error) {
      console.error('Error al cargar asistencia activa:', error);
    }
  };

  const abrirSelectorInHouse = () => {
    if (inHouses.length === 0) {
      setMensaje({ 
        tipo: 'error', 
        texto: '❌ No tienes In Houses asignados. Contacta al administrador.' 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return;
    }
    setMostrarSelectorInHouse(true);
  };

  const handleMarcarIngreso = async () => {
    if (!inHouseSeleccionado) {
      setMensaje({ tipo: 'error', texto: '❌ Debes seleccionar un In House' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return;
    }

    try {
      setProcesando(true);
      const response = await attendanceAPI.marcarIngreso({ inHouseId: inHouseSeleccionado });
      setAsistenciaActiva(response.data.asistencia);
      setMensaje({ tipo: 'success', texto: '✅ Ingreso marcado exitosamente' });
      setMostrarSelectorInHouse(false);
      setInHouseSeleccionado('');
      cargarMisAsistencias();
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.message || '❌ Error al marcar ingreso' 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } finally {
      setProcesando(false);
    }
  };

  const handleMarcarSalida = async () => {
    try {
      setProcesando(true);
      await attendanceAPI.marcarSalida(asistenciaActiva._id);
      setAsistenciaActiva(null);
      setMensaje({ tipo: 'success', texto: '✅ Salida marcada exitosamente' });
      cargarMisAsistencias();
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.message || '❌ Error al marcar salida' 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-accent-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Mensaje de bienvenida */}
          <div className="card bg-gradient-to-r from-primary to-secondary text-white mb-8 animate-fade-in">
            <div className="flex items-center">
              <CheckCircle size={48} className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  ¡Bienvenido/a, {usuario?.nombre}!
                </h1>
                <p className="text-white/90">
                  Marca tu ingreso y salida durante el día
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes de notificación */}
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-xl animate-slide-down ${
              mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
              'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}>
              <div className="flex items-center">
                {mensaje.tipo === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                {mensaje.texto}
              </div>
            </div>
          )}

          {/* Botones de Ingreso/Salida */}
          <div className="card mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🕐 Control de Asistencia
            </h2>
            
            {asistenciaActiva ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800 font-semibold">Estado: Ingreso Activo</span>
                    <span className="badge bg-green-500 text-white">Activo</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-1">
                    <Clock size={16} className="mr-2 text-green-600" />
                    <span>Hora de ingreso: <strong>{asistenciaActiva.horaIngreso}</strong></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-2 text-green-600" />
                    <span>{format(new Date(asistenciaActiva.fecha), "EEEE, dd 'de' MMMM", { locale: es })}</span>
                  </div>
                </div>
                <button
                  onClick={handleMarcarSalida}
                  disabled={procesando}
                  className="w-full btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={20} className="mr-2" />
                  {procesando ? 'Marcando salida...' : 'Marcar Salida'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
                  <p className="text-gray-600">No tienes un ingreso activo</p>
                </div>
                <button
                  onClick={abrirSelectorInHouse}
                  disabled={procesando}
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn size={20} className="mr-2" />
                  Marcar Ingreso
                </button>
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="card mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              👤 Mi Información
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-accent rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-800">
                  {usuario?.nombreCompleto}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Área</p>
                <p className="text-lg font-semibold text-gray-800">
                  {usuario?.area}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Correo</p>
                <p className="text-lg font-semibold text-gray-800">
                  {usuario?.correo}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Celular</p>
                <p className="text-lg font-semibold text-gray-800">
                  {usuario?.celular}
                </p>
              </div>
            </div>
          </div>

          {/* Mis últimas asistencias */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Mis Últimas Asistencias
              </h2>
              <span className="badge bg-primary text-white">
                <TrendingUp size={14} className="mr-1" />
                {misAsistencias.length} registros
              </span>
            </div>

            {cargando ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando asistencias...</p>
              </div>
            ) : misAsistencias.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tienes asistencias registradas
              </div>
            ) : (
              <div className="space-y-3">
                {misAsistencias.map((asistencia, index) => (
                  <div
                    key={asistencia._id}
                    className="p-4 bg-accent rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center text-gray-800 font-semibold mb-2">
                            <Calendar size={16} className="text-primary mr-2" />
                            {format(new Date(asistencia.fecha), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-gray-600">
                              <LogIn size={14} className="text-green-600 mr-2" />
                              <span className="text-sm">Ingreso: <strong>{asistencia.horaIngreso}</strong></span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <LogOut size={14} className="text-red-600 mr-2" />
                              <span className="text-sm">
                                Salida: <strong>{asistencia.horaSalida || 'Pendiente'}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {asistencia.estado === 'completado' ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : (
                        <span className="badge bg-yellow-500 text-white">Activo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border-l-4 border-primary animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ℹ️ Información Importante
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Marca tu ingreso al comenzar tu jornada laboral
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Puedes marcar múltiples ingresos y salidas durante el día
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Recuerda marcar tu salida antes de terminar tu jornada
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Los administradores y CEOs pueden ver todos los registros
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Selector de In House */}
      {mostrarSelectorInHouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Selecciona el In House
            </h2>
            <p className="text-gray-600 mb-6">
              ¿En qué empresa vas a trabajar hoy?
            </p>
            
            <div className="space-y-3 mb-6">
              {inHouses.map((inHouse) => (
                <label
                  key={inHouse._id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    inHouseSeleccionado === inHouse._id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inHouse"
                    value={inHouse._id}
                    checked={inHouseSeleccionado === inHouse._id}
                    onChange={(e) => setInHouseSeleccionado(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      inHouseSeleccionado === inHouse._id
                        ? 'border-primary'
                        : 'border-gray-300'
                    }`}>
                      {inHouseSeleccionado === inHouse._id && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{inHouse.nombre}</p>
                      {inHouse.area && (
                        <p className="text-sm text-gray-500">Área: {inHouse.area.nombre}</p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMarcarIngreso}
                disabled={!inHouseSeleccionado || procesando}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? 'Marcando...' : 'Confirmar Ingreso'}
              </button>
              <button
                onClick={() => {
                  setMostrarSelectorInHouse(false);
                  setInHouseSeleccionado('');
                }}
                disabled={procesando}
                className="flex-1 btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserHome;
