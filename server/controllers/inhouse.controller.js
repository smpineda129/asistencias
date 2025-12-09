const InHouse = require('../models/InHouse');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');

// @desc    Crear nuevo In House
// @route   POST /api/inhouses
// @access  Private/Admin/AdminArea
exports.crearInHouse = async (req, res) => {
  try {
    const { nombre, areas, encargado, ubicacion } = req.body;

    // Validar que se proporcionen áreas
    if (!areas || areas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe asignar al menos un área'
      });
    }

    // Validar coordenadas
    if (!ubicacion || !ubicacion.coordenadas || !ubicacion.coordenadas.lat || !ubicacion.coordenadas.lng) {
      return res.status(400).json({
        success: false,
        message: 'Las coordenadas de ubicación son requeridas'
      });
    }

    // Validar que el encargado exista
    if (!encargado) {
      return res.status(400).json({
        success: false,
        message: 'Debe asignar un encargado'
      });
    }

    const usuarioEncargado = await User.findById(encargado);
    if (!usuarioEncargado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario encargado no encontrado'
      });
    }

    const inHouse = await InHouse.create({
      nombre,
      areas,
      encargado,
      ubicacion: {
        direccion: ubicacion.direccion || '',
        coordenadas: {
          type: 'Point',
          coordinates: [ubicacion.coordenadas.lng, ubicacion.coordenadas.lat] // GeoJSON: [longitude, latitude]
        },
        radioPermitido: ubicacion.radioPermitido || 100
      }
    });

    // Actualizar el usuario para que sea encargado de este InHouse
    usuarioEncargado.rol = 'encargado_inhouse';
    usuarioEncargado.inHouseEncargado = inHouse._id;
    await usuarioEncargado.save();

    const inHouseResponse = await InHouse.findById(inHouse._id)
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre codigo');

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

// @desc    Obtener In House del encargado autenticado
// @route   GET /api/inhouses/mi-inhouse
// @access  Private (encargado_inhouse)
exports.obtenerMiInHouse = async (req, res) => {
  try {
    // El usuario debe tener rol encargado_inhouse y un inHouseEncargado asignado
    if (req.usuario.rol !== 'encargado_inhouse' || !req.usuario.inHouseEncargado) {
      return res.status(403).json({
        success: false,
        message: 'No tienes un In House asignado'
      });
    }

    const inHouse = await InHouse.findById(req.usuario.inHouseEncargado)
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre codigo')
      .populate('usuariosAsignados', 'nombre apellidos correo');

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
    console.error('Error al obtener In House del encargado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener In House',
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

    if (area) filtro.areas = area;
    if (activo !== undefined) filtro.activo = activo === 'true';

    const inHouses = await InHouse.find(filtro)
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre codigo')
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
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre codigo descripcion')
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
    const { nombre, areas, encargado, activo, ubicacion } = req.body;

    const inHouse = await InHouse.findById(req.params.id);
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    // Guardar encargado anterior
    const encargadoAnterior = inHouse.encargado;

    // Actualizar campos
    if (nombre) inHouse.nombre = nombre;
    if (areas) inHouse.areas = areas;
    if (activo !== undefined) inHouse.activo = activo;
    
    // Actualizar encargado
    if (encargado && encargado !== encargadoAnterior?.toString()) {
      // Validar que el nuevo encargado exista
      const nuevoEncargado = await User.findById(encargado);
      if (!nuevoEncargado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario encargado no encontrado'
        });
      }

      // Remover rol del encargado anterior si existe
      if (encargadoAnterior) {
        const usuarioAnterior = await User.findById(encargadoAnterior);
        if (usuarioAnterior && usuarioAnterior.rol === 'encargado_inhouse') {
          usuarioAnterior.rol = 'user';
          usuarioAnterior.inHouseEncargado = null;
          await usuarioAnterior.save();
        }
      }

      // Asignar rol al nuevo encargado
      nuevoEncargado.rol = 'encargado_inhouse';
      nuevoEncargado.inHouseEncargado = inHouse._id;
      await nuevoEncargado.save();

      inHouse.encargado = encargado;
    }
    
    // Actualizar ubicación
    if (ubicacion) {
      if (ubicacion.direccion !== undefined) inHouse.ubicacion.direccion = ubicacion.direccion;
      if (ubicacion.coordenadas && ubicacion.coordenadas.lat !== undefined && ubicacion.coordenadas.lng !== undefined) {
        inHouse.ubicacion.coordenadas = {
          type: 'Point',
          coordinates: [ubicacion.coordenadas.lng, ubicacion.coordenadas.lat] // GeoJSON: [longitude, latitude]
        };
      }
      if (ubicacion.radioPermitido !== undefined) inHouse.ubicacion.radioPermitido = ubicacion.radioPermitido;
    }

    await inHouse.save();

    const inHouseResponse = await InHouse.findById(inHouse._id)
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre codigo');

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

    const inHouse = await InHouse.findById(req.params.id).populate('areas');
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

    // Verificar que el InHouse tenga áreas asignadas
    if (!inHouse.areas || inHouse.areas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El In House no tiene áreas asignadas'
      });
    }

    console.log('Usuario encontrado:', { 
      nombre: usuario.nombre, 
      area: usuario.area._id || usuario.area 
    });
    console.log('InHouse encontrado:', { 
      nombre: inHouse.nombre, 
      areas: inHouse.areas 
    });

    // Verificar que el usuario pertenezca a una de las áreas del In House
    const usuarioAreaId = usuario.area._id ? usuario.area._id.toString() : usuario.area.toString();
    const inHouseAreaIds = inHouse.areas.map(a => 
      a._id ? a._id.toString() : a.toString()
    );
    
    if (!inHouseAreaIds.includes(usuarioAreaId)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no pertenece a ninguna de las áreas del In House'
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

// @desc    Eliminar In House
// @route   DELETE /api/inhouses/:id
// @access  Private/Admin/AdminArea
exports.eliminarInHouse = async (req, res) => {
  try {
    const inHouse = await InHouse.findById(req.params.id);
    
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    // Remover In House de todos los usuarios asignados
    if (inHouse.usuariosAsignados && inHouse.usuariosAsignados.length > 0) {
      await User.updateMany(
        { _id: { $in: inHouse.usuariosAsignados } },
        { $pull: { inHousesAsignados: inHouse._id } }
      );
    }

    // Eliminar el In House
    await InHouse.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'In House eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar In House:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar In House',
      error: error.message
    });
  }
};

// @desc    Asignar múltiples usuarios a In House
// @route   PUT /api/inhouses/:id/asignar-usuarios
// @access  Private/Admin/AdminArea
exports.asignarUsuarios = async (req, res) => {
  try {
    const { usuariosIds } = req.body;

    const inHouse = await InHouse.findById(req.params.id);
    if (!inHouse) {
      return res.status(404).json({
        success: false,
        message: 'In House no encontrado'
      });
    }

    // Validar que usuariosIds sea un array
    if (!Array.isArray(usuariosIds)) {
      return res.status(400).json({
        success: false,
        message: 'usuariosIds debe ser un array'
      });
    }

    // Obtener usuarios actuales
    const usuariosActuales = inHouse.usuariosAsignados || [];
    
    // Usuarios a remover (estaban antes pero ya no están en la nueva lista)
    const usuariosARemover = usuariosActuales.filter(
      id => !usuariosIds.includes(id.toString())
    );
    
    // Usuarios a agregar (están en la nueva lista pero no estaban antes)
    const usuariosAAgregar = usuariosIds.filter(
      id => !usuariosActuales.some(uid => uid.toString() === id)
    );

    // Remover InHouse de usuarios que ya no están asignados
    if (usuariosARemover.length > 0) {
      await User.updateMany(
        { _id: { $in: usuariosARemover } },
        { $pull: { inHousesAsignados: inHouse._id } }
      );
    }

    // Agregar InHouse a nuevos usuarios
    if (usuariosAAgregar.length > 0) {
      await User.updateMany(
        { _id: { $in: usuariosAAgregar } },
        { $addToSet: { inHousesAsignados: inHouse._id } }
      );
    }

    // Actualizar lista de usuarios en InHouse
    inHouse.usuariosAsignados = usuariosIds;
    await inHouse.save();

    // Obtener InHouse actualizado con usuarios poblados
    const inHouseActualizado = await InHouse.findById(req.params.id)
      .populate('usuariosAsignados', 'nombre apellidos correo')
      .populate('encargado', 'nombre apellidos correo')
      .populate('areas', 'nombre');

    res.json({
      success: true,
      message: 'Usuarios asignados exitosamente',
      inHouse: inHouseActualizado
    });
  } catch (error) {
    console.error('Error al asignar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar usuarios',
      error: error.message
    });
  }
};
