const mongoose = require('mongoose');

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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Las coordenadas son requeridas']
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

// Índices para búsquedas rápidas
inHouseSchema.index({ areas: 1 });
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
  // coordinates es [longitude, latitude] en GeoJSON
  const [storedLng, storedLat] = this.ubicacion.coordenadas.coordinates;
  
  const φ1 = storedLat * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  const Δφ = (lat - storedLat) * Math.PI / 180;
  const Δλ = (lng - storedLng) * Math.PI / 180;

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
