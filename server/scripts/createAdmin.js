/**
 * Script para crear un usuario administrador inicial
 * Ejecutar: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

// Esquema de usuario simplificado
const userSchema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  correo: String,
  celular: String,
  area: String,
  rol: String,
  password: String,
  activo: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const crearAdmin = async () => {
  try {
    // Conectar a MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sistema-asistencia';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const adminExistente = await User.findOne({ correo: 'admin@empresa.com' });
    
    if (adminExistente) {
      console.log('⚠️  Ya existe un usuario administrador con el correo admin@empresa.com');
      console.log('Si deseas crear otro admin, cambia el correo en el script.');
      process.exit(0);
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Crear usuario admin
    const admin = await User.create({
      nombre: 'Admin',
      apellidos: 'Sistema',
      correo: 'admin@empresa.com',
      celular: '1234567890',
      area: 'Administración',
      rol: 'admin',
      password: passwordHash,
      activo: true
    });

    console.log('\n✅ Usuario administrador creado exitosamente!\n');
    console.log('📧 Correo: admin@empresa.com');
    console.log('🔑 Contraseña: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia estas credenciales después del primer inicio de sesión.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear administrador:', error);
    process.exit(1);
  }
};

crearAdmin();
