const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  inHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InHouse',
    required: false // Temporal: hacer opcional para compatibilidad con datos existentes
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  horaIngreso: {
    type: String,
    required: true
  },
  horaSalida: {
    type: String,
    default: null
  },
  estado: {
    type: String,
    enum: ['activo', 'completado'],
    default: 'activo'
  },
  userAgent: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índice para mejorar búsquedas por usuario y fecha
attendanceSchema.index({ usuario: 1, fecha: -1 });

// Método estático para obtener asistencias por rango de fechas
attendanceSchema.statics.obtenerPorRango = function(fechaInicio, fechaFin, usuarioId = null) {
  const query = {
    fecha: {
      $gte: new Date(fechaInicio),
      $lte: new Date(fechaFin)
    }
  };
  
  if (usuarioId) {
    query.usuario = usuarioId;
  }
  
  return this.find(query)
    .populate('usuario', 'nombre apellidos correo area rol')
    .sort({ fecha: -1 });
};

// Método estático para contar asistencias por usuario
attendanceSchema.statics.contarPorUsuario = function(fechaInicio, fechaFin) {
  return this.aggregate([
    {
      $match: {
        fecha: {
          $gte: new Date(fechaInicio),
          $lte: new Date(fechaFin)
        }
      }
    },
    {
      $group: {
        _id: '$usuario',
        totalAsistencias: { $sum: 1 },
        ultimaAsistencia: { $max: '$fecha' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'usuarioInfo'
      }
    },
    {
      $unwind: '$usuarioInfo'
    },
    {
      $project: {
        _id: 1,
        totalAsistencias: 1,
        ultimaAsistencia: 1,
        nombre: '$usuarioInfo.nombre',
        apellidos: '$usuarioInfo.apellidos',
        area: '$usuarioInfo.area'
      }
    },
    {
      $sort: { totalAsistencias: -1 }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
