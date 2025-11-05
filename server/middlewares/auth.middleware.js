const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Middleware para proteger rutas - verifica JWT
 */
const protegerRuta = async (req, res, next) => {
  try {
    let token;
    
    // Verificar si existe token en headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario del token
    req.usuario = await User.findById(decoded.id).select('-password');
    
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    if (!req.usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado - Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware solo para administradores
 */
const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado - Solo administradores'
    });
  }
  next();
};

module.exports = {
  protegerRuta,
  verificarRol,
  soloAdmin
};
