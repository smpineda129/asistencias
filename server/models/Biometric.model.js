const mongoose = require('mongoose');

const biometricSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['huella'],
    default: 'huella',
    required: true
  },
  // Template de huella encriptado (FMD - Fingerprint Minutiae Data)
  template: {
    type: String,
    required: true
  },
  // Dedo registrado
  dedo: {
    type: String,
    enum: [
      'pulgar_derecho',
      'indice_derecho',
      'medio_derecho',
      'anular_derecho',
      'menique_derecho',
      'pulgar_izquierdo',
      'indice_izquierdo',
      'medio_izquierdo',
      'anular_izquierdo',
      'menique_izquierdo'
    ],
    required: true
  },
  // Calidad de la captura (0-100)
  calidad: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  // Información del dispositivo usado para captura
  dispositivo: {
    modelo: {
      type: String,
      default: 'DigitalPersona 4500'
    },
    serial: String,
    version: String
  },
  activo: {
    type: Boolean,
    default: true
  },
  // Historial de uso
  ultimoUso: {
    type: Date,
    default: null
  },
  vecesUsado: {
    type: Number,
    default: 0
  },
  // Metadata adicional
  metadata: {
    resolucion: String,
    formato: String,
    tamanio: Number
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas rápidas
biometricSchema.index({ usuario: 1, activo: 1 });
biometricSchema.index({ usuario: 1, dedo: 1 }, { unique: true });

// Método para registrar uso de huella
biometricSchema.methods.registrarUso = function() {
  this.ultimoUso = new Date();
  this.vecesUsado += 1;
  return this.save();
};

// Método estático para obtener huellas activas de un usuario
biometricSchema.statics.obtenerHuellasUsuario = function(usuarioId) {
  return this.find({ 
    usuario: usuarioId, 
    activo: true 
  }).sort({ createdAt: -1 });
};

// Método estático para verificar si un usuario tiene huellas registradas
biometricSchema.statics.tieneHuellasRegistradas = async function(usuarioId) {
  const count = await this.countDocuments({ 
    usuario: usuarioId, 
    activo: true 
  });
  return count > 0;
};

// Método estático para obtener todas las huellas activas (para verificación)
biometricSchema.statics.obtenerTodasActivas = function() {
  return this.find({ activo: true })
    .populate('usuario', 'nombre apellidos correo area rol activo')
    .select('usuario template dedo calidad');
};

module.exports = mongoose.model('Biometric', biometricSchema);
