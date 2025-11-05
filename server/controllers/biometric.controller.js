const Biometric = require('../models/Biometric.model');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const biometricService = require('../services/biometric.service');

/**
 * Registrar una nueva huella dactilar para un usuario
 */
exports.enrollFingerprint = async (req, res) => {
  try {
    const { usuarioId, template, dedo, calidad, deviceInfo } = req.body;

    // Validar datos de entrada
    const validation = biometricService.validateEnrollmentData({
      usuarioId,
      template,
      dedo,
      calidad
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de registro inválidos',
        errors: validation.errors
      });
    }

    // Verificar que el usuario existe y está activo
    const user = await User.findById(usuarioId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.activo) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no está activo'
      });
    }

    // Verificar si ya existe una huella para este dedo
    const existingFingerprint = await Biometric.findOne({
      usuario: usuarioId,
      dedo: dedo,
      activo: true
    });

    if (existingFingerprint) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una huella registrada para ${dedo.replace('_', ' ')}`
      });
    }

    // Encriptar el template
    const encryptedTemplate = biometricService.encryptTemplate(template);

    // Crear registro biométrico
    const biometric = await Biometric.create({
      usuario: usuarioId,
      tipo: 'huella',
      template: encryptedTemplate,
      dedo: dedo,
      calidad: calidad,
      dispositivo: {
        modelo: deviceInfo?.modelo || 'DigitalPersona 4500',
        serial: deviceInfo?.serial,
        version: deviceInfo?.version
      },
      metadata: biometricService.generateMetadata(deviceInfo)
    });

    // Poblar información del usuario
    await biometric.populate('usuario', 'nombre apellidos correo');

    res.status(201).json({
      success: true,
      message: 'Huella registrada exitosamente',
      data: {
        id: biometric._id,
        usuario: biometric.usuario,
        dedo: biometric.dedo,
        calidad: biometric.calidad,
        fechaRegistro: biometric.createdAt
      }
    });

  } catch (error) {
    console.error('Error al registrar huella:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar huella dactilar',
      error: error.message
    });
  }
};

/**
 * Obtener todas las huellas registradas de un usuario
 */
exports.getUserFingerprints = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const fingerprints = await Biometric.obtenerHuellasUsuario(usuarioId);

    res.json({
      success: true,
      data: fingerprints.map(fp => ({
        id: fp._id,
        dedo: fp.dedo,
        calidad: fp.calidad,
        activo: fp.activo,
        ultimoUso: fp.ultimoUso,
        vecesUsado: fp.vecesUsado,
        fechaRegistro: fp.createdAt
      }))
    });

  } catch (error) {
    console.error('Error al obtener huellas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener huellas del usuario',
      error: error.message
    });
  }
};

/**
 * Verificar huella y marcar asistencia
 * Este es el endpoint principal para el terminal de marcación
 */
exports.verifyAndCheckIn = async (req, res) => {
  try {
    const { template, inHouseId } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template de huella es requerido'
      });
    }

    // Validar formato del template
    if (!biometricService.validateTemplateFormat(template)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de template inválido'
      });
    }

    // Obtener todas las huellas activas
    const biometrics = await Biometric.obtenerTodasActivas();

    if (biometrics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay huellas registradas en el sistema'
      });
    }

    // Buscar coincidencia
    let matchedBiometric = null;
    let bestScore = 0;

    for (const bio of biometrics) {
      // Verificar que el usuario esté activo
      if (!bio.usuario.activo) continue;

      const comparison = biometricService.compareTemplates(bio.template, template);
      
      if (comparison.match && comparison.score > bestScore) {
        bestScore = comparison.score;
        matchedBiometric = bio;
      }
    }

    if (!matchedBiometric) {
      return res.status(404).json({
        success: false,
        message: 'Huella no reconocida. Por favor intente nuevamente.'
      });
    }

    // Registrar uso de la huella
    await matchedBiometric.registrarUso();

    // Verificar si hay una asistencia activa (sin salida) para hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const asistenciaActiva = await Attendance.findOne({
      usuario: matchedBiometric.usuario._id,
      fecha: { $gte: hoy, $lt: mañana },
      estado: 'activo'
    });

    let attendance;
    let action;

    if (asistenciaActiva) {
      // Marcar salida
      const ahora = new Date();
      asistenciaActiva.horaSalida = ahora.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      asistenciaActiva.estado = 'completado';
      attendance = await asistenciaActiva.save();
      action = 'salida';
    } else {
      // Marcar ingreso
      const ahora = new Date();
      attendance = await Attendance.create({
        usuario: matchedBiometric.usuario._id,
        inHouse: inHouseId || null,
        fecha: ahora,
        horaIngreso: ahora.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        estado: 'activo',
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || req.connection.remoteAddress || ''
      });
      action = 'ingreso';
    }

    // Poblar datos del usuario
    await attendance.populate('usuario', 'nombre apellidos correo area');

    res.json({
      success: true,
      message: `${action === 'ingreso' ? 'Ingreso' : 'Salida'} registrado exitosamente`,
      data: {
        action,
        usuario: {
          id: matchedBiometric.usuario._id,
          nombre: matchedBiometric.usuario.nombre,
          apellidos: matchedBiometric.usuario.apellidos,
          nombreCompleto: `${matchedBiometric.usuario.nombre} ${matchedBiometric.usuario.apellidos}`
        },
        asistencia: {
          id: attendance._id,
          fecha: attendance.fecha,
          horaIngreso: attendance.horaIngreso,
          horaSalida: attendance.horaSalida,
          estado: attendance.estado
        },
        biometric: {
          dedo: matchedBiometric.dedo,
          calidad: matchedBiometric.calidad,
          confidence: bestScore
        }
      }
    });

  } catch (error) {
    console.error('Error al verificar huella:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar huella dactilar',
      error: error.message
    });
  }
};

/**
 * Eliminar (desactivar) una huella
 */
exports.deleteFingerprint = async (req, res) => {
  try {
    const { id } = req.params;

    const biometric = await Biometric.findById(id);

    if (!biometric) {
      return res.status(404).json({
        success: false,
        message: 'Huella no encontrada'
      });
    }

    // Desactivar en lugar de eliminar (para mantener historial)
    biometric.activo = false;
    await biometric.save();

    res.json({
      success: true,
      message: 'Huella eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar huella:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar huella',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de uso biométrico
 */
exports.getBiometricStats = async (req, res) => {
  try {
    const totalHuellas = await Biometric.countDocuments({ activo: true });
    const usuariosConHuella = await Biometric.distinct('usuario', { activo: true });
    const totalUsuarios = await User.countDocuments({ activo: true });
    
    const huellasRecientes = await Biometric.find({ activo: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('usuario', 'nombre apellidos')
      .select('usuario dedo calidad createdAt');

    const huellasUsadas = await Biometric.find({ 
      activo: true,
      ultimoUso: { $ne: null }
    })
      .sort({ ultimoUso: -1 })
      .limit(10)
      .populate('usuario', 'nombre apellidos')
      .select('usuario dedo ultimoUso vecesUsado');

    res.json({
      success: true,
      data: {
        resumen: {
          totalHuellas,
          usuariosConHuella: usuariosConHuella.length,
          totalUsuarios,
          porcentajeCobertura: ((usuariosConHuella.length / totalUsuarios) * 100).toFixed(2)
        },
        recientes: huellasRecientes,
        masUsadas: huellasUsadas
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas biométricas',
      error: error.message
    });
  }
};

/**
 * Verificar si un usuario tiene huellas registradas
 */
exports.checkUserHasFingerprints = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const hasFingerprints = await Biometric.tieneHuellasRegistradas(usuarioId);
    const count = await Biometric.countDocuments({ 
      usuario: usuarioId, 
      activo: true 
    });

    res.json({
      success: true,
      data: {
        hasFingerprints,
        count
      }
    });

  } catch (error) {
    console.error('Error al verificar huellas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar huellas del usuario',
      error: error.message
    });
  }
};
