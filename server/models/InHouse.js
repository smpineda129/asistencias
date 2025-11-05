const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const inHouseSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: [true, 'El área es requerida']
  },
  encargado: {
    type: String,
    required: [true, 'El nombre del encargado es requerido'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 6,
    select: false // No devolver password por defecto
  },
  usuariosAsignados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activo: {
    type: Boolean,
    default: true
  },
  // Configuración de visualización
  permisos: {
    verTiempoReal: {
      type: Boolean,
      default: true
    },
    verHistorial: {
      type: Boolean,
      default: true
    },
    exportarReportes: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Middleware para encriptar contraseña antes de guardar
inHouseSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
inHouseSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// Índices para búsquedas rápidas
inHouseSchema.index({ area: 1 });
inHouseSchema.index({ correo: 1 }, { unique: true });
inHouseSchema.index({ activo: 1 });

// Virtual para contar usuarios asignados
inHouseSchema.virtual('totalUsuariosAsignados').get(function() {
  return this.usuariosAsignados.length;
});

// Método para verificar si un usuario está asignado
inHouseSchema.methods.tieneUsuarioAsignado = function(usuarioId) {
  return this.usuariosAsignados.some(id => id.toString() === usuarioId.toString());
};

// Método para agregar usuario
inHouseSchema.methods.agregarUsuario = async function(usuarioId) {
  if (!this.tieneUsuarioAsignado(usuarioId)) {
    this.usuariosAsignados.push(usuarioId);
    await this.save();
  }
  return this;
};

// Método para remover usuario
inHouseSchema.methods.removerUsuario = async function(usuarioId) {
  this.usuariosAsignados = this.usuariosAsignados.filter(
    id => id.toString() !== usuarioId.toString()
  );
  await this.save();
  return this;
};

// Método para obtener estadísticas
inHouseSchema.methods.obtenerEstadisticas = async function() {
  const Attendance = mongoose.model('Attendance');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const usuariosActivos = await Attendance.countDocuments({
    usuario: { $in: this.usuariosAsignados },
    fecha: { $gte: hoy },
    estado: 'activo'
  });
  
  return {
    totalUsuarios: this.usuariosAsignados.length,
    usuariosActivosHoy: usuariosActivos,
    nombre: this.nombre,
    encargado: this.encargado
  };
};

module.exports = mongoose.model('InHouse', inHouseSchema);
