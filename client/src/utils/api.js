import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  login: (credenciales) => api.post('/auth/login', credenciales),
  obtenerPerfil: () => api.get('/auth/perfil'),
  verificarToken: () => api.get('/auth/verificar')
};

// Funciones de usuarios
export const userAPI = {
  obtenerTodos: (params) => api.get('/users', { params }),
  obtenerPorId: (id) => api.get(`/users/${id}`),
  crear: (datos) => api.post('/users', datos),
  actualizar: (id, datos) => api.put(`/users/${id}`, datos),
  eliminar: (id) => api.delete(`/users/${id}`),
  obtenerPorRol: (rol) => api.get(`/users/rol/${rol}`)
};

// Funciones de asistencias
export const attendanceAPI = {
  obtenerTodas: (params) => api.get('/attendance', { params }),
  obtenerPorRango: (params) => api.get('/attendance/rango', { params }),
  obtenerEstadisticas: (params) => api.get('/attendance/estadisticas', { params }),
  obtenerPorUsuario: (usuarioId, params) => api.get(`/attendance/usuario/${usuarioId}`, { params }),
  obtenerResumenDias: (params) => api.get('/attendance/resumen-dias', { params }),
  eliminar: (id) => api.delete(`/attendance/${id}`),
  marcarIngreso: (data) => api.post('/attendance/ingreso', data),
  marcarSalida: (id) => api.put(`/attendance/salida/${id}`),
  obtenerAsistenciaActiva: () => api.get('/attendance/activa'),
  obtenerEstadoTiempoReal: () => api.get('/attendance/estado-tiempo-real')
};

// Funciones de biometría
export const biometricAPI = {
  registrarHuella: (datos) => api.post('/biometric/enroll', datos),
  verificarHuella: (datos) => api.post('/biometric/verify', datos),
  obtenerHuellasUsuario: (usuarioId) => api.get(`/biometric/user/${usuarioId}`),
  verificarTieneHuellas: (usuarioId) => api.get(`/biometric/user/${usuarioId}/check`),
  eliminarHuella: (id) => api.delete(`/biometric/${id}`),
  obtenerEstadisticas: () => api.get('/biometric/stats')
};

export default api;
