const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');

/**
 * Obtener todas las asistencias con filtros
 * GET /api/attendance
 */
const obtenerAsistencias = async (req, res) => {
  try {
    const { usuarioId, fechaInicio, fechaFin, limite } = req.query;
    
    // Construir query
    const query = {};
    
    if (usuarioId) {
      query.usuario = usuarioId;
    }
    
    // Filtro por rango de fechas
    if (fechaInicio || fechaFin) {
      query.fecha = {};
      if (fechaInicio) {
        query.fecha.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        // Agregar 23:59:59 al final del día
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        query.fecha.$lte = fechaFinDate;
      }
    }
    
    // Ejecutar query con populate
    let queryBuilder = Attendance.find(query)
      .populate('usuario', 'nombre apellidos correo area rol')
      .sort({ fecha: -1, hora: -1 });
    
    // Aplicar límite si existe
    if (limite) {
      queryBuilder = queryBuilder.limit(parseInt(limite));
    }
    
    const asistencias = await queryBuilder;
    
    res.status(200).json({
      success: true,
      total: asistencias.length,
      asistencias
    });
    
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias',
      error: error.message
    });
  }
};

/**
 * Obtener asistencias por rango de fechas
 * GET /api/attendance/rango
 */
const obtenerAsistenciasPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, usuarioId } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    }
    
    // Ajustar fecha fin para incluir todo el día
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);
    
    const asistencias = await Attendance.obtenerPorRango(
      fechaInicio,
      fechaFinDate,
      usuarioId || null
    );
    
    res.status(200).json({
      success: true,
      total: asistencias.length,
      fechaInicio,
      fechaFin,
      asistencias
    });
    
  } catch (error) {
    console.error('Error al obtener asistencias por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de asistencias
 * GET /api/attendance/estadisticas
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Si no se proporcionan fechas, usar últimos 30 días
    const fechaFin_ = fechaFin ? new Date(fechaFin) : new Date();
    fechaFin_.setHours(23, 59, 59, 999);
    
    const fechaInicio_ = fechaInicio 
      ? new Date(fechaInicio) 
      : new Date(fechaFin_.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Obtener conteo por usuario
    const conteoPorUsuario = await Attendance.contarPorUsuario(fechaInicio_, fechaFin_);
    
    // Obtener total de asistencias
    const totalAsistencias = await Attendance.countDocuments({
      fecha: {
        $gte: fechaInicio_,
        $lte: fechaFin_
      }
    });
    
    // Obtener usuarios activos (que tienen al menos una asistencia)
    const usuariosActivos = conteoPorUsuario.length;
    
    // Obtener últimas 5 asistencias
    const ultimasAsistencias = await Attendance.find({
      fecha: {
        $gte: fechaInicio_,
        $lte: fechaFin_
      }
    })
      .populate('usuario', 'nombre apellidos area')
      .sort({ fecha: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      periodo: {
        fechaInicio: fechaInicio_,
        fechaFin: fechaFin_
      },
      estadisticas: {
        totalAsistencias,
        usuariosActivos,
        promedioAsistenciasPorUsuario: usuariosActivos > 0 
          ? (totalAsistencias / usuariosActivos).toFixed(2) 
          : 0
      },
      conteoPorUsuario,
      ultimasAsistencias
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

/**
 * Obtener asistencias de un usuario específico
 * GET /api/attendance/usuario/:usuarioId
 */
const obtenerAsistenciasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limite } = req.query;
    
    // Verificar permisos: usuarios normales solo pueden ver sus propias asistencias
    if (req.usuario.rol === 'user' && req.usuario._id.toString() !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver las asistencias de otro usuario'
      });
    }
    
    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    let query = Attendance.find({ usuario: usuarioId })
      .populate('usuario', 'nombre apellidos correo area')
      .sort({ fecha: -1 });
    
    if (limite) {
      query = query.limit(parseInt(limite));
    }
    
    const asistencias = await query;
    
    res.status(200).json({
      success: true,
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.getNombreCompleto(),
        area: usuario.area
      },
      total: asistencias.length,
      asistencias
    });
    
  } catch (error) {
    console.error('Error al obtener asistencias del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias',
      error: error.message
    });
  }
};

/**
 * Obtener resumen de asistencias por días
 * GET /api/attendance/resumen-dias
 */
const obtenerResumenPorDias = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    
    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));
    fechaInicio.setHours(0, 0, 0, 0);
    
    const resumen = await Attendance.aggregate([
      {
        $match: {
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$fecha' }
          },
          totalAsistencias: { $sum: 1 },
          usuariosUnicos: { $addToSet: '$usuario' }
        }
      },
      {
        $project: {
          fecha: '$_id',
          totalAsistencias: 1,
          usuariosUnicos: { $size: '$usuariosUnicos' },
          _id: 0
        }
      },
      {
        $sort: { fecha: 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      periodo: {
        dias: parseInt(dias),
        fechaInicio,
        fechaFin
      },
      resumen
    });
    
  } catch (error) {
    console.error('Error al obtener resumen por días:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message
    });
  }
};

/**
 * Eliminar asistencia (solo admin)
 * DELETE /api/attendance/:id
 */
const eliminarAsistencia = async (req, res) => {
  try {
    const asistencia = await Attendance.findById(req.params.id);
    
    if (!asistencia) {
      return res.status(404).json({
        success: false,
        message: 'Asistencia no encontrada'
      });
    }
    
    await Attendance.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Asistencia eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar asistencia',
      error: error.message
    });
  }
};

/**
 * Marcar ingreso
 * POST /api/attendance/ingreso
 */
const marcarIngreso = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    const { inHouseId } = req.body;
    
    // Validar que se proporcione el inHouseId
    if (!inHouseId) {
      return res.status(400).json({
        success: false,
        message: 'Debes seleccionar un In House para marcar ingreso'
      });
    }
    
    // Verificar que el usuario esté asignado al In House
    const usuario = await User.findById(usuarioId);
    if (!usuario.inHousesAsignados.includes(inHouseId)) {
      return res.status(403).json({
        success: false,
        message: 'No estás asignado a este In House'
      });
    }
    
    // Verificar si ya tiene una asistencia activa hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);
    
    const asistenciaActiva = await Attendance.findOne({
      usuario: usuarioId,
      fecha: { $gte: hoy, $lte: finDia },
      estado: 'activo'
    });
    
    if (asistenciaActiva) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un ingreso activo. Debes marcar la salida primero.',
        asistenciaActiva
      });
    }
    
    // Crear nueva asistencia
    const ahora = new Date();
    const horaIngreso = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const nuevaAsistencia = await Attendance.create({
      usuario: usuarioId,
      inHouse: inHouseId,
      fecha: ahora,
      horaIngreso,
      estado: 'activo',
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || ''
    });
    
    const asistenciaPopulada = await Attendance.findById(nuevaAsistencia._id)
      .populate('usuario', 'nombre apellidos correo area')
      .populate('inHouse', 'nombre encargado');
    
    res.status(201).json({
      success: true,
      message: 'Ingreso marcado exitosamente',
      asistencia: asistenciaPopulada
    });
    
  } catch (error) {
    console.error('Error al marcar ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar ingreso',
      error: error.message
    });
  }
};

/**
 * Marcar salida
 * PUT /api/attendance/salida/:id
 */
const marcarSalida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario._id;
    
    // Buscar la asistencia
    const asistencia = await Attendance.findById(id);
    
    if (!asistencia) {
      return res.status(404).json({
        success: false,
        message: 'Asistencia no encontrada'
      });
    }
    
    // Verificar que la asistencia pertenece al usuario
    if (asistencia.usuario.toString() !== usuarioId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para marcar esta salida'
      });
    }
    
    // Verificar que la asistencia está activa
    if (asistencia.estado === 'completado') {
      return res.status(400).json({
        success: false,
        message: 'Esta asistencia ya tiene salida marcada'
      });
    }
    
    // Marcar salida
    const ahora = new Date();
    const horaSalida = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    asistencia.horaSalida = horaSalida;
    asistencia.estado = 'completado';
    await asistencia.save();
    
    const asistenciaPopulada = await Attendance.findById(asistencia._id)
      .populate('usuario', 'nombre apellidos correo area');
    
    res.status(200).json({
      success: true,
      message: 'Salida marcada exitosamente',
      asistencia: asistenciaPopulada
    });
    
  } catch (error) {
    console.error('Error al marcar salida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar salida',
      error: error.message
    });
  }
};

/**
 * Obtener asistencia activa del usuario
 * GET /api/attendance/activa
 */
const obtenerAsistenciaActiva = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    
    // Buscar asistencia activa de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);
    
    const asistenciaActiva = await Attendance.findOne({
      usuario: usuarioId,
      fecha: { $gte: hoy, $lte: finDia },
      estado: 'activo'
    }).populate('usuario', 'nombre apellidos correo area');
    
    if (!asistenciaActiva) {
      return res.status(200).json({
        success: true,
        asistenciaActiva: null
      });
    }
    
    res.status(200).json({
      success: true,
      asistenciaActiva
    });
    
  } catch (error) {
    console.error('Error al obtener asistencia activa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencia activa',
      error: error.message
    });
  }
};

/**
 * Obtener estado en tiempo real de todos los usuarios
 * GET /api/attendance/estado-tiempo-real
 */
const obtenerEstadoTiempoReal = async (req, res) => {
  try {
    // Obtener todos los usuarios activos
    const todosLosUsuarios = await User.find({ activo: true, rol: { $ne: 'admin' } })
      .select('nombre apellidos correo area rol')
      .sort({ nombre: 1 });
    
    // Obtener asistencias activas de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);
    
    const asistenciasActivas = await Attendance.find({
      fecha: { $gte: hoy, $lte: finDia },
      estado: 'activo'
    }).populate('usuario', 'nombre apellidos correo area rol');
    
    // Obtener TODAS las asistencias de hoy (activas y completadas) para contar ingresos
    const todasAsistenciasHoy = await Attendance.find({
      fecha: { $gte: hoy, $lte: finDia }
    }).populate('usuario', 'nombre apellidos correo area rol');
    
    // Contar ingresos por usuario
    const ingresosPorUsuario = new Map();
    todasAsistenciasHoy.forEach(asistencia => {
      if (asistencia.usuario) {
        const usuarioId = asistencia.usuario._id.toString();
        ingresosPorUsuario.set(usuarioId, (ingresosPorUsuario.get(usuarioId) || 0) + 1);
      }
    });
    
    // Crear mapa de usuarios con ingreso activo
    const usuariosActivosMap = new Map();
    asistenciasActivas.forEach(asistencia => {
      if (asistencia.usuario) {
        usuariosActivosMap.set(asistencia.usuario._id.toString(), {
          usuario: asistencia.usuario,
          asistencia: {
            id: asistencia._id,
            horaIngreso: asistencia.horaIngreso,
            fecha: asistencia.fecha
          }
        });
      }
    });
    
    // Clasificar usuarios
    const usuariosActivos = [];
    const usuariosInactivos = [];
    
    todosLosUsuarios.forEach(usuario => {
      const usuarioId = usuario._id.toString();
      const totalIngresos = ingresosPorUsuario.get(usuarioId) || 0;
      
      if (usuariosActivosMap.has(usuarioId)) {
        const data = usuariosActivosMap.get(usuarioId);
        usuariosActivos.push({
          id: usuario._id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
          correo: usuario.correo,
          area: usuario.area,
          rol: usuario.rol,
          estado: 'activo',
          horaIngreso: data.asistencia.horaIngreso,
          asistenciaId: data.asistencia.id,
          totalIngresosHoy: totalIngresos
        });
      } else {
        usuariosInactivos.push({
          id: usuario._id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
          correo: usuario.correo,
          area: usuario.area,
          rol: usuario.rol,
          estado: 'inactivo',
          totalIngresosHoy: totalIngresos
        });
      }
    });
    
    // Obtener conteo de asistencias completadas hoy
    const asistenciasCompletadasHoy = await Attendance.countDocuments({
      fecha: { $gte: hoy, $lte: finDia },
      estado: 'completado'
    });
    
    // Total de ingresos del día
    const totalIngresosHoy = todasAsistenciasHoy.length;
    
    res.status(200).json({
      success: true,
      fecha: new Date(),
      resumen: {
        totalUsuarios: todosLosUsuarios.length,
        usuariosActivos: usuariosActivos.length,
        usuariosInactivos: usuariosInactivos.length,
        asistenciasCompletadas: asistenciasCompletadasHoy,
        totalIngresosHoy: totalIngresosHoy,
        porcentajeActivos: todosLosUsuarios.length > 0 
          ? ((usuariosActivos.length / todosLosUsuarios.length) * 100).toFixed(1)
          : 0
      },
      usuariosActivos,
      usuariosInactivos
    });
    
  } catch (error) {
    console.error('Error al obtener estado en tiempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado en tiempo real',
      error: error.message
    });
  }
};

module.exports = {
  obtenerAsistencias,
  obtenerAsistenciasPorRango,
  obtenerEstadisticas,
  obtenerAsistenciasUsuario,
  obtenerResumenPorDias,
  eliminarAsistencia,
  marcarIngreso,
  marcarSalida,
  obtenerAsistenciaActiva,
  obtenerEstadoTiempoReal
};
