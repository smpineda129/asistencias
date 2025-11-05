const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const { enviarNotificacionIngreso } = require('../services/email.service');

/**
 * Generar JWT Token
 */
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Formatear fecha y hora
 */
const formatearFechaHora = (fecha) => {
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return fecha.toLocaleString('es-ES', opciones);
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Validar datos
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione correo y contraseña'
      });
    }
    
    // Buscar usuario con password
    const usuario = await User.findOne({ correo }).select('+password');
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }
    
    // Verificar contraseña
    const passwordValido = await usuario.compararPassword(password);
    
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token
    const token = generarToken(usuario._id);
    
    // Responder con datos del usuario (sin password)
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        nombreCompleto: usuario.getNombreCompleto(),
        correo: usuario.correo,
        celular: usuario.celular,
        area: usuario.area,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/perfil
 */
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        nombreCompleto: usuario.getNombreCompleto(),
        correo: usuario.correo,
        celular: usuario.celular,
        area: usuario.area,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

/**
 * Verificar token
 * GET /api/auth/verificar
 */
const verificarToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token válido',
      usuario: {
        id: req.usuario._id,
        nombre: req.usuario.nombre,
        apellidos: req.usuario.apellidos,
        correo: req.usuario.correo,
        rol: req.usuario.rol
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = {
  login,
  obtenerPerfil,
  verificarToken
};
