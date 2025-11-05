import React, { useState, useEffect } from 'react';
import { attendanceAPI, userAPI } from '../utils/api';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [resumenDias, setResumenDias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filtros
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [diasRango, setDiasRango] = useState('30');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar usuarios
      const usuariosRes = await userAPI.obtenerTodos({ activo: true });
      setUsuarios(usuariosRes.data.usuarios || []);
      
      // Cargar estadísticas
      await cargarEstadisticas();
      
      // Cargar asistencias
      await cargarAsistencias();
      
      // Cargar resumen por días
      await cargarResumenDias();
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const params = {
        fechaInicio,
        fechaFin
      };
      
      const response = await attendanceAPI.obtenerEstadisticas(params);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarAsistencias = async () => {
    try {
      const params = {
        fechaInicio,
        fechaFin
      };
      
      if (usuarioSeleccionado) {
        params.usuarioId = usuarioSeleccionado;
      }
      
      const response = await attendanceAPI.obtenerPorRango(params);
      setAsistencias(response.data.asistencias || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    }
  };

  const cargarResumenDias = async () => {
    try {
      const response = await attendanceAPI.obtenerResumenDias({ dias: diasRango });
      setResumenDias(response.data.resumen || []);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  const aplicarFiltros = async () => {
    setCargando(true);
    await cargarEstadisticas();
    await cargarAsistencias();
    await cargarResumenDias();
    setCargando(false);
    toast.success('Filtros aplicados');
  };

  const cambiarRangoDias = (dias) => {
    setDiasRango(dias);
    const nuevaFechaInicio = format(subDays(new Date(), parseInt(dias)), 'yyyy-MM-dd');
    setFechaInicio(nuevaFechaInicio);
    setFechaFin(format(new Date(), 'yyyy-MM-dd'));
  };

  const filtrarHoy = () => {
    const hoy = format(new Date(), 'yyyy-MM-dd');
    setFechaInicio(hoy);
    setFechaFin(hoy);
    setDiasRango('custom');
    toast.success('Filtro de hoy aplicado');
  };

  // Calcular paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const asistenciasPaginadas = asistencias.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(asistencias.length / registrosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const exportarCSV = () => {
    if (asistencias.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Hora', 'Usuario', 'Área', 'Rol'];
    const rows = asistencias.map(a => [
      format(new Date(a.fecha), 'dd/MM/yyyy'),
      a.hora,
      a.usuario?.nombreCompleto || `${a.usuario?.nombre} ${a.usuario?.apellidos}`,
      a.usuario?.area || '',
      a.usuario?.rol || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `asistencias_${fechaInicio}_${fechaFin}.csv`;
    link.click();
    
    toast.success('Archivo CSV descargado');
  };

  if (cargando && !estadisticas) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando dashboard...</p>
          </div>
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📊 Dashboard de Asistencias
            </h1>
            <p className="text-gray-600">
              Visualiza y analiza las asistencias del personal
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Asistencias</p>
                  <p className="text-4xl font-bold">
                    {estadisticas?.estadisticas?.totalAsistencias || 0}
                  </p>
                </div>
                <Calendar size={48} className="text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Usuarios Activos</p>
                  <p className="text-4xl font-bold">
                    {estadisticas?.estadisticas?.usuariosActivos || 0}
                  </p>
                </div>
                <Users size={48} className="text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Promedio por Usuario</p>
                  <p className="text-4xl font-bold">
                    {estadisticas?.estadisticas?.promedioAsistenciasPorUsuario || 0}
                  </p>
                </div>
                <TrendingUp size={48} className="text-purple-200" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="card mb-8 animate-slide-up">
            <div className="flex items-center mb-4">
              <Filter className="text-primary mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Filtros</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Rango rápido */}
              <div>
                <label className="label-field">Rango Rápido</label>
                <select
                  value={diasRango}
                  onChange={(e) => cambiarRangoDias(e.target.value)}
                  className="input-field"
                >
                  <option value="7">Últimos 7 días</option>
                  <option value="20">Últimos 20 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="50">Últimos 50 días</option>
                  <option value="100">Últimos 100 días</option>
                </select>
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="label-field">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Fecha fin */}
              <div>
                <label className="label-field">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Usuario */}
              <div>
                <label className="label-field">Usuario</label>
                <select
                  value={usuarioSeleccionado}
                  onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map(usuario => (
                    <option key={usuario._id} value={usuario._id}>
                      {usuario.nombre} {usuario.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={filtrarHoy}
                className="btn-primary bg-orange-500 hover:bg-orange-600"
              >
                <Calendar className="mr-2" size={18} />
                Hoy
              </button>
              
              <button
                onClick={aplicarFiltros}
                disabled={cargando}
                className="btn-primary disabled:opacity-50"
              >
                <Filter className="mr-2" size={18} />
                Aplicar Filtros
              </button>
              
              <button
                onClick={exportarCSV}
                className="btn-secondary"
              >
                <Download className="mr-2" size={18} />
                Exportar CSV
              </button>
              
              <button
                onClick={cargarDatos}
                disabled={cargando}
                className="btn-outline disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 ${cargando ? 'animate-spin' : ''}`} size={18} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Gráfica de asistencias por día */}
          {resumenDias.length > 0 && (
            <div className="card mb-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📈 Asistencias por Día
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resumenDias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalAsistencias" 
                    stroke="#0033CC" 
                    strokeWidth={2}
                    name="Asistencias"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usuariosUnicos" 
                    stroke="#38BDF8" 
                    strokeWidth={2}
                    name="Usuarios Únicos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top usuarios */}
          {estadisticas?.conteoPorUsuario && estadisticas.conteoPorUsuario.length > 0 && (
            <div className="card mb-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🏆 Top Asistencias por Usuario
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas.conteoPorUsuario.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalAsistencias" fill="#0033CC" name="Asistencias" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla de asistencias */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Registro de Asistencias
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Mostrando {indicePrimero + 1}-{Math.min(indiceUltimo, asistencias.length)} de{' '}
                  <span className="font-bold text-primary">{asistencias.length}</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header rounded-tl-xl">Fecha</th>
                    <th className="table-header">Ingreso</th>
                    <th className="table-header">Salida</th>
                    <th className="table-header">Usuario</th>
                    <th className="table-header">Área</th>
                    <th className="table-header">Rol</th>
                    <th className="table-header rounded-tr-xl">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No hay asistencias registradas en este período
                      </td>
                    </tr>
                  ) : (
                    asistenciasPaginadas.map((asistencia, index) => (
                      <tr 
                        key={asistencia._id} 
                        className="hover:bg-accent transition-colors duration-200"
                      >
                        <td className="table-cell">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-primary mr-2" />
                            {format(new Date(asistencia.fecha), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <LogIn size={14} className="text-green-600 mr-2" />
                            <span className="font-semibold">{asistencia.horaIngreso}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          {asistencia.horaSalida ? (
                            <div className="flex items-center">
                              <LogOut size={14} className="text-red-600 mr-2" />
                              <span className="font-semibold">{asistencia.horaSalida}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Pendiente</span>
                          )}
                        </td>
                        <td className="table-cell font-semibold">
                          {asistencia.usuario?.nombreCompleto || 
                           `${asistencia.usuario?.nombre} ${asistencia.usuario?.apellidos}`}
                        </td>
                        <td className="table-cell">{asistencia.usuario?.area}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            asistencia.usuario?.rol === 'admin' ? 'badge-admin' :
                            asistencia.usuario?.rol === 'ceo' ? 'badge-ceo' :
                            'badge-user'
                          }`}>
                            {asistencia.usuario?.rol?.toUpperCase()}
                          </span>
                        </td>
                        <td className="table-cell">
                          {asistencia.estado === 'completado' ? (
                            <span className="badge bg-green-100 text-green-800">
                              Completado
                            </span>
                          ) : (
                            <span className="badge bg-yellow-100 text-yellow-800">
                              Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Anterior
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPaginas)].map((_, index) => {
                    const numeroPagina = index + 1;
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      numeroPagina === 1 ||
                      numeroPagina === totalPaginas ||
                      (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                    ) {
                      return (
                        <button
                          key={numeroPagina}
                          onClick={() => cambiarPagina(numeroPagina)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            paginaActual === numeroPagina
                              ? 'bg-primary text-white font-semibold'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {numeroPagina}
                        </button>
                      );
                    } else if (
                      numeroPagina === paginaActual - 2 ||
                      numeroPagina === paginaActual + 2
                    ) {
                      return <span key={numeroPagina} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
