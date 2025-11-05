const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del área es requerido'],
    trim: true,
    unique: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del área es requerida'],
    trim: true
  },
  codigo: {
    type: String,
    required: [true, 'El código del área es requerido'],
    uppercase: true,
    trim: true
  },
  administrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El administrador del área es requerido']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
areaSchema.index({ codigo: 1 }, { unique: true });
areaSchema.index({ administrador: 1 });
areaSchema.index({ activo: 1 });

// Virtual para obtener empresas del área
areaSchema.virtual('empresas', {
  ref: 'InHouse',
  localField: '_id',
  foreignField: 'area'
});

// Método para obtener estadísticas del área
areaSchema.methods.obtenerEstadisticas = async function() {
  const InHouse = mongoose.model('InHouse');
  const User = mongoose.model('User');
  
  const totalEmpresas = await InHouse.countDocuments({ area: this._id, activo: true });
  const totalUsuarios = await User.countDocuments({ area: this._id, activo: true });
  
  return {
    totalEmpresas,
    totalUsuarios,
    nombre: this.nombre,
    codigo: this.codigo
  };
};

module.exports = mongoose.model('Area', areaSchema);
