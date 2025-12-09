require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelos
const User = require('../models/User.model');
const Area = require('../models/Area');

const initDB = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const adminExistente = await User.findOne({ rol: 'admin' });
    
    if (adminExistente) {
      console.log('ℹ️  Ya existe un usuario admin:', adminExistente.correo);
      console.log('📧 Correo:', adminExistente.correo);
      console.log('👤 Nombre:', adminExistente.nombreCompleto);
      
      const continuar = process.argv.includes('--force');
      if (!continuar) {
        console.log('\n💡 Si deseas crear un nuevo admin, ejecuta: npm run init-db -- --force');
        await mongoose.connection.close();
        return;
      }
    }

    console.log('\n🔧 Creando usuario administrador temporal...');
    
    // Crear usuario admin temporal sin área
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Crear un ObjectId temporal para el área
    const tempAreaId = new mongoose.Types.ObjectId();
    
    const admin = new User({
      nombre: 'Admin',
      apellidos: 'Sistema',
      correo: 'admin@sistema.com',
      password: passwordHash,
      celular: '0000000000',
      area: tempAreaId,
      rol: 'admin',
      activo: true
    });
    
    await admin.save({ validateBeforeSave: false });
    console.log('✅ Usuario admin creado temporalmente');

    console.log('\n🔧 Creando área administrativa...');
    
    // Crear área con el admin
    let area = await Area.findOne({ codigo: 'ADM-001' });
    if (!area) {
      area = new Area({
        _id: tempAreaId,
        nombre: 'Administración',
        descripcion: 'Área administrativa principal',
        codigo: 'ADM-001',
        administrador: admin._id,
        activo: true
      });
      await area.save();
      console.log('✅ Área creada:', area.nombre);
    } else {
      console.log('ℹ️  Área ya existe:', area.nombre);
      admin.area = area._id;
      await admin.save();
    }

    console.log('✅ Usuario administrador configurado correctamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Correo:     admin@sistema.com');
    console.log('🔑 Contraseña: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');

    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('🚀 Ahora puedes iniciar sesión en la aplicación\n');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

// Ejecutar
initDB();
