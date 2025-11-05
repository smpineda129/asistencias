const User = require('../models/User.model');

/**
 * Obtener todos los usuarios
 * GET /api/users
 */
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol, activo, area } = req.query;
    
    // Construir filtro
    const filtro = {};
    if (rol) filtro.rol = rol;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (area) filtro.area = area;
    
    const usuarios = await User.find(filtro)
      .select('-password')
      .populate('area', 'nombre')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      total: usuarios.length,
      usuarios
    });
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 */
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id)
      .select('-password')
      .populate('area', 'nombre')
      .populate('inHousesAsignados', 'nombre');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      usuario
    });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * Crear nuevo usuario (solo admin)
 * POST /api/users
 */
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, correo, celular, area, rol, password } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellidos || !correo || !celular || !area || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }
    
    // Verificar si el correo ya existe
    const usuarioExistente = await User.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }
    
    // Crear usuario
    const usuario = await User.create({
      nombre,
      apellidos,
      correo,
      celular,
      area,
      rol: rol || 'user',
      password
    });
    
    // Responder sin password
    const usuarioRespuesta = await User.findById(usuario._id).select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: usuarioRespuesta
    });
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errores
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

/**
 * Actualizar usuario
 * PUT /api/users/:id
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, correo, celular, area, rol, activo, password } = req.body;
    
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Si se actualiza el correo, verificar que no exista
    if (correo && correo !== usuario.correo) {
      const correoExistente = await User.findOne({ correo });
      if (correoExistente) {
        return res.status(400).json({
          success: false,
          message: 'El correo ya está registrado'
        });
      }
    }
    
    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (apellidos) usuario.apellidos = apellidos;
    if (correo) usuario.correo = correo;
    if (celular) usuario.celular = celular;
    if (area) usuario.area = area;
    if (rol) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;
    if (password) usuario.password = password; // Se encriptará automáticamente
    
    await usuario.save();
    
    // Responder sin password
    const usuarioActualizado = await User.findById(usuario._id).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

/**
 * Eliminar usuario
 * DELETE /api/users/:id
 */
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Prevenir que el admin se elimine a sí mismo
    if (usuario._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

/**
 * Obtener usuarios por rol
 * GET /api/users/rol/:rol
 */
const obtenerUsuariosPorRol = async (req, res) => {
  try {
    const { rol } = req.params;
    
    if (!['admin', 'user', 'ceo'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }
    
    const usuarios = await User.find({ rol, activo: true })
      .select('-password')
      .sort({ nombre: 1 });
    
    res.status(200).json({
      success: true,
      total: usuarios.length,
      usuarios
    });
    
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuariosPorRol
};
