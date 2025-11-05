const InHouse = require('../models/InHouse');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Crear nuevo In House
// @route   POST /api/inhouses
// @access  Private/Admin/AdminArea
exports.crearInHouse = async (req, res) => {
  try {
    const { nombre, area, encargado, correo, password, permisos } = req.body;

    // Verificar correo único
    const inHouseExistente = await InHouse.findOne({ correo });
    if (inHouseExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptado = await bcrypt.hash(password, salt);

    const inHouse = await InHouse.create({
      nombre,
      area,
      encargado,
      correo,
      password: passwordEncriptado,
      permisos: permisos || {
        verTiempoReal: true,
        verHistorial: true,
        exportarReportes: false
      }
    });

    // No devolver password
    const inHouseResponse = inHouse.toObject();
    delete inHouseResponse.password;

    res.status(201).json({
      success: true,
      message: 'In House creado exitosamente',
      inHouse: inHouseResponse
    });
  } catch (error) {
    console.error('Error al crear In House:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear In House',
      error: error.message
    });
  }
};

// @desc    Login de encargado de In House
// @route   POST /api/inhouses/login
// @access  Public
exports.loginInHouse = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscar In House con password
    const inHouse = await InHouse.findOne({ correo, activo: true })
      .select('+password')
      .populate('area', 'nombre codigo');

    if (!inHouse) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, inHouse.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: inHouse._id, 
        tipo: 'inhouse',
        area: inHouse.area._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Respuesta sin password
    const inHouseResponse = inHouse.toObject();
    delete inHouseResponse.password;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      inHouse: inHouseResponse
    });
  } catch (error) {
    console.error('Error en login In House:', error);
    res.status(500).json({
      success: false,
      message: 'Error en inicio de sesión',
      error: error.message
    });
  }
};

// @desc    Obtener todos los In Houses
// @route   GET /api/inhouses
// @access  Private
exports.obtenerInHouses = async (req, res) => {
  try {
    const { area, activo } = req.query;
    const filtro = {};

    if (area) filtro.area = area;
    if (activo !== undefined) filtro.activo = activo === 'true';

    const inHouses = await InHouse.find(filtro)
      .populate('area', 'nombre codigo')
      .populate('usuariosAsignados', 'nombre apellidos correo')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      total: inHouses.length,
      inHouses
    });
  } catch (error) {
    console.error('Error al obtener In Houses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener In Houses',
      error: error.message
    });
  }
};

// @desc    Obtener In House por ID
// @route   GET /api/inhouses/:id
// @access  Private
exports.obtenerInHousePorId = async (req, res) => {
  try {
    const inHouse = await InHouse.findById(req.params.id)
      .populate('area', 'nombre codigo descripcion')
      .populate('usuariosAsignados', 'nombre apellidos correo celular');

    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    res.json({
      success: true,
      inHouse
    });
  } catch (error) {
    console.error('Error al obtener In House:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener In House',
      error: error.message
    });
  }
};

// @desc    Actualizar In House
// @route   PUT /api/inhouses/:id
// @access  Private/Admin/AdminArea
exports.actualizarInHouse = async (req, res) => {
  try {
    const { nombre, encargado, correo, password, permisos, activo } = req.body;

    const inHouse = await InHouse.findById(req.params.id);
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) inHouse.nombre = nombre;
    if (encargado) inHouse.encargado = encargado;
    if (correo) inHouse.correo = correo;
    if (permisos) inHouse.permisos = { ...inHouse.permisos, ...permisos };
    if (activo !== undefined) inHouse.activo = activo;

    // Actualizar contraseña si se proporciona
    if (password) {
      const salt = await bcrypt.genSalt(10);
      inHouse.password = await bcrypt.hash(password, salt);
    }

    await inHouse.save();

    const inHouseResponse = inHouse.toObject();
    delete inHouseResponse.password;

    res.json({
      success: true,
      message: 'In House actualizado exitosamente',
      inHouse: inHouseResponse
    });
  } catch (error) {
    console.error('Error al actualizar In House:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar In House',
      error: error.message
    });
  }
};

// @desc    Asignar usuario a In House
// @route   POST /api/inhouses/:id/usuarios
// @access  Private/Admin/AdminArea
exports.asignarUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.body;

    console.log('Asignando usuario:', { inhouseId: req.params.id, usuarioId });

    const inHouse = await InHouse.findById(req.params.id).populate('area');
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    const usuario = await User.findById(usuarioId).populate('area');
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario tenga área asignada
    if (!usuario.area) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene un área asignada'
      });
    }

    // Verificar que el InHouse tenga área asignada
    if (!inHouse.area) {
      return res.status(400).json({
        success: false,
        message: 'El In House no tiene un área asignada'
      });
    }

    console.log('Usuario encontrado:', { 
      nombre: usuario.nombre, 
      area: usuario.area._id || usuario.area 
    });
    console.log('InHouse encontrado:', { 
      nombre: inHouse.nombre, 
      area: inHouse.area._id || inHouse.area 
    });

    // Verificar que el usuario pertenezca a la misma área
    // Comparar los IDs correctamente (pueden ser ObjectId o objetos populados)
    const usuarioAreaId = usuario.area._id ? usuario.area._id.toString() : usuario.area.toString();
    const inHouseAreaId = inHouse.area._id ? inHouse.area._id.toString() : inHouse.area.toString();
    
    if (usuarioAreaId !== inHouseAreaId) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no pertenece al área del In House'
      });
    }

    // Verificar si el usuario ya está asignado
    if (inHouse.tieneUsuarioAsignado(usuarioId)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está asignado a este In House'
      });
    }

    // Agregar usuario al In House
    console.log('Agregando usuario al InHouse...');
    await inHouse.agregarUsuario(usuarioId);

    // Agregar In House a la lista del usuario
    console.log('Agregando InHouse al usuario...');
    if (!usuario.inHousesAsignados) {
      usuario.inHousesAsignados = [];
    }
    
    if (!usuario.inHousesAsignados.some(ih => ih.toString() === inHouse._id.toString())) {
      usuario.inHousesAsignados.push(inHouse._id);
      await usuario.save();
    }

    console.log('Usuario asignado exitosamente');

    res.json({
      success: true,
      message: 'Usuario asignado exitosamente',
      inHouse: await InHouse.findById(req.params.id)
        .populate('usuariosAsignados', 'nombre apellidos correo')
    });
  } catch (error) {
    console.error('Error detallado al asignar usuario:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al asignar usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Remover usuario de In House
// @route   DELETE /api/inhouses/:id/usuarios/:usuarioId
// @access  Private/Admin/AdminArea
exports.removerUsuario = async (req, res) => {
  try {
    const { id, usuarioId } = req.params;

    const inHouse = await InHouse.findById(id);
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    // Remover usuario del In House
    await inHouse.removerUsuario(usuarioId);

    // Remover In House de la lista del usuario
    const usuario = await User.findById(usuarioId);
    if (usuario) {
      usuario.inHousesAsignados = usuario.inHousesAsignados.filter(
        ih => ih.toString() !== id
      );
      await usuario.save();
    }

    res.json({
      success: true,
      message: 'Usuario removido exitosamente'
    });
  } catch (error) {
    console.error('Error al remover usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover usuario',
      error: error.message
    });
  }
};

// @desc    Obtener tiempo real del In House
// @route   GET /api/inhouses/:id/tiempo-real
// @access  Private
exports.obtenerTiempoReal = async (req, res) => {
  try {
    const inHouse = await InHouse.findById(req.params.id)
      .populate('usuariosAsignados', 'nombre apellidos correo');

    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener asistencias activas del día
    const asistenciasActivas = await Attendance.find({
      inHouse: inHouse._id,
      fecha: { $gte: hoy },
      estado: 'activo'
    }).populate('usuario', 'nombre apellidos');

    // IDs de usuarios activos
    const usuariosActivosIds = asistenciasActivas.map(a => a.usuario._id.toString());

    // Separar usuarios activos e inactivos
    const usuariosActivos = [];
    const usuariosInactivos = [];

    for (const usuario of inHouse.usuariosAsignados) {
      if (usuariosActivosIds.includes(usuario._id.toString())) {
        const asistencia = asistenciasActivas.find(
          a => a.usuario._id.toString() === usuario._id.toString()
        );
        usuariosActivos.push({
          ...usuario.toObject(),
          horaIngreso: asistencia.horaIngreso,
          asistenciaId: asistencia._id
        });
      } else {
        usuariosInactivos.push(usuario);
      }
    }

    // Contar total de ingresos del día
    const totalIngresosHoy = await Attendance.countDocuments({
      inHouse: inHouse._id,
      fecha: { $gte: hoy }
    });

    res.json({
      success: true,
      fecha: new Date(),
      inHouse: {
        nombre: inHouse.nombre,
        encargado: inHouse.encargado
      },
      resumen: {
        totalUsuarios: inHouse.usuariosAsignados.length,
        usuariosActivos: usuariosActivos.length,
        usuariosInactivos: usuariosInactivos.length,
        totalIngresosHoy,
        porcentajeActivos: inHouse.usuariosAsignados.length > 0
          ? ((usuariosActivos.length / inHouse.usuariosAsignados.length) * 100).toFixed(1)
          : '0'
      },
      usuariosActivos,
      usuariosInactivos
    });
  } catch (error) {
    console.error('Error al obtener tiempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tiempo real',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas del In House
// @route   GET /api/inhouses/:id/estadisticas
// @access  Private
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const inHouse = await InHouse.findById(req.params.id);
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    const estadisticas = await inHouse.obtenerEstadisticas();

    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
