const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const inHouseSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
  },
  areas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }],
  // Geolocalización
  ubicacion: {
    direccion: {
      type: String,
      trim: true
    },
    coordenadas: {
      lat: {
        type: Number,
        required: [true, 'La latitud es requerida']
      },
      lng: {
        type: Number,
        required: [true, 'La longitud es requerida']
      }
    },
    radioPermitido: {
      type: Number,
      default: 100 // metros
    }
  },
  // Encargado del InHouse (usuario existente)
  encargado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El encargado es requerido']
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
inHouseSchema.index({ areas: 1 });
inHouseSchema.index({ correo: 1 }, { unique: true });
inHouseSchema.index({ activo: 1 });
inHouseSchema.index({ 'ubicacion.coordenadas': '2dsphere' }); // Índice geoespacial

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

// Método para validar distancia usando fórmula de Haversine
inHouseSchema.methods.validarDistancia = function(lat, lng) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = this.ubicacion.coordenadas.lat * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  const Δφ = (lat - this.ubicacion.coordenadas.lat) * Math.PI / 180;
  const Δλ = (lng - this.ubicacion.coordenadas.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distancia = R * c; // Distancia en metros

  return {
    dentroDelRango: distancia <= this.ubicacion.radioPermitido,
    distancia: Math.round(distancia),
    radioPermitido: this.ubicacion.radioPermitido
  };
};

module.exports = mongoose.model('InHouse', inHouseSchema);
