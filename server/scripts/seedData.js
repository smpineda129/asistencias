/**
 * Script para poblar la base de datos con datos de prueba
 * Ejecutar: node scripts/seedData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

// Esquemas simplificados
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

const attendanceSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fecha: Date,
  horaIngreso: String,
  horaSalida: { type: String, default: null },
  estado: { type: String, enum: ['activo', 'completado'], default: 'activo' },
  userAgent: String,
  ip: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

const seedData = async () => {
  try {
    // Conectar a MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sistema-asistencia';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    console.log('\n🗑️  Limpiando datos existentes...');
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Datos limpiados');

    // Encriptar contraseña por defecto
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Crear usuarios de prueba
    console.log('\n👥 Creando usuarios...');
    
    const usuarios = [
      // Admin
      {
        nombre: 'Admin',
        apellidos: 'Sistema',
        correo: 'admin@empresa.com',
        celular: '1234567890',
        area: 'Administración',
        rol: 'admin',
        password: passwordHash,
        activo: true
      },
      // CEOs
      {
        nombre: 'Carlos',
        apellidos: 'Rodríguez',
        correo: 'carlos.rodriguez@empresa.com',
        celular: '9876543210',
        area: 'Dirección General',
        rol: 'ceo',
        password: passwordHash,
        activo: true
      },
      {
        nombre: 'Ana',
        apellidos: 'Martínez',
        correo: 'ana.martinez@empresa.com',
        celular: '5551234567',
        area: 'Dirección Financiera',
        rol: 'ceo',
        password: passwordHash,
        activo: true
      },
      // Usuarios normales
      {
        nombre: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan.perez@empresa.com',
        celular: '5559876543',
        area: 'Ventas',
        rol: 'user',
        password: passwordHash,
        activo: true
      },
      {
        nombre: 'María',
        apellidos: 'García',
        correo: 'maria.garcia@empresa.com',
        celular: '5551112222',
        area: 'Marketing',
        rol: 'user',
        password: passwordHash,
        activo: true
      },
      {
        nombre: 'Pedro',
        apellidos: 'López',
        correo: 'pedro.lopez@empresa.com',
        celular: '5553334444',
        area: 'Desarrollo',
        rol: 'user',
        password: passwordHash,
        activo: true
      },
      {
        nombre: 'Laura',
        apellidos: 'Sánchez',
        correo: 'laura.sanchez@empresa.com',
        celular: '5555556666',
        area: 'Recursos Humanos',
        rol: 'user',
        password: passwordHash,
        activo: true
      },
      {
        nombre: 'Diego',
        apellidos: 'Ramírez',
        correo: 'diego.ramirez@empresa.com',
        celular: '5557778888',
        area: 'Soporte Técnico',
        rol: 'user',
        password: passwordHash,
        activo: true
      }
    ];

    const usuariosCreados = await User.insertMany(usuarios);
    console.log(`✅ ${usuariosCreados.length} usuarios creados`);

    // Crear asistencias de prueba (últimos 30 días)
    console.log('\n📋 Creando asistencias de prueba...');
    
    const asistencias = [];
    const hoy = new Date();
    
    // Para cada usuario (excepto admin)
    for (let i = 1; i < usuariosCreados.length; i++) {
      const usuario = usuariosCreados[i];
      
      // Crear entre 15 y 25 asistencias en los últimos 30 días
      const numAsistencias = Math.floor(Math.random() * 11) + 15;
      
      for (let j = 0; j < numAsistencias; j++) {
        // Fecha aleatoria en los últimos 30 días
        const diasAtras = Math.floor(Math.random() * 30);
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - diasAtras);
        
        // Hora de ingreso aleatoria entre 7:00 AM y 10:00 AM
        const horaIngreso = Math.floor(Math.random() * 4) + 7; // 7-10
        const minutosIngreso = Math.floor(Math.random() * 60);
        const fechaIngreso = new Date(fecha);
        fechaIngreso.setHours(horaIngreso, minutosIngreso, 0, 0);
        
        const horaIngresoFormateada = fechaIngreso.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        // 80% de probabilidad de tener salida marcada
        let horaSalidaFormateada = null;
        let estado = 'activo';
        
        if (Math.random() > 0.2) {
          // Hora de salida aleatoria entre 4:00 PM y 7:00 PM
          const horaSalida = Math.floor(Math.random() * 4) + 16; // 16-19
          const minutosSalida = Math.floor(Math.random() * 60);
          const fechaSalida = new Date(fecha);
          fechaSalida.setHours(horaSalida, minutosSalida, 0, 0);
          
          horaSalidaFormateada = fechaSalida.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          estado = 'completado';
        }
        
        asistencias.push({
          usuario: usuario._id,
          fecha: fechaIngreso,
          horaIngreso: horaIngresoFormateada,
          horaSalida: horaSalidaFormateada,
          estado: estado,
          userAgent: 'Mozilla/5.0 (Seed Data)',
          ip: '127.0.0.1'
        });
      }
    }
    
    const asistenciasCreadas = await Attendance.insertMany(asistencias);
    console.log(`✅ ${asistenciasCreadas.length} asistencias creadas`);

    // Resumen
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Usuarios totales: ${usuariosCreados.length}`);
    console.log(`   - Administradores: 1`);
    console.log(`   - CEOs: 2`);
    console.log(`   - Usuarios: ${usuariosCreados.length - 3}`);
    console.log(`📋 Asistencias: ${asistenciasCreadas.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🔑 CREDENCIALES DE ACCESO:');
    console.log('───────────────────────────────────────');
    console.log('Admin:');
    console.log('  📧 Correo: admin@empresa.com');
    console.log('  🔑 Contraseña: password123\n');
    console.log('CEO:');
    console.log('  📧 Correo: carlos.rodriguez@empresa.com');
    console.log('  🔑 Contraseña: password123\n');
    console.log('Usuario:');
    console.log('  📧 Correo: juan.perez@empresa.com');
    console.log('  🔑 Contraseña: password123\n');
    console.log('───────────────────────────────────────\n');

    console.log('✅ Base de datos poblada exitosamente!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedData();
