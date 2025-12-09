/**
 * Script simplificado para crear usuarios de prueba con todos los roles del sistema
 * No crea InHouses para evitar problemas con índices geoespaciales
 * 
 * Roles disponibles:
 * - admin: Administrador del sistema
 * - user: Usuario regular
 * - ceo: CEO de la empresa
 * - admin_area: Administrador de área
 * - encargado_inhouse: Encargado de InHouse
 * 
 * Uso: node scripts/seed-users-simple.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Area = require('../models/Area');

// Configuración de usuarios por rol
const usuariosPorRol = [
  {
    nombre: 'Admin',
    apellidos: 'Sistema',
    correo: 'admin@sistema.com',
    celular: '1234567890',
    rol: 'admin',
    password: 'admin123'
  },
  {
    nombre: 'Usuario',
    apellidos: 'Regular',
    correo: 'user@sistema.com',
    celular: '1234567891',
    rol: 'user',
    password: 'user123'
  },
  {
    nombre: 'CEO',
    apellidos: 'Empresa',
    correo: 'ceo@sistema.com',
    celular: '1234567892',
    rol: 'ceo',
    password: 'ceo123'
  },
  {
    nombre: 'Admin',
    apellidos: 'Area',
    correo: 'adminarea@sistema.com',
    celular: '1234567893',
    rol: 'admin_area',
    password: 'adminarea123'
  },
  {
    nombre: 'Encargado',
    apellidos: 'InHouse',
    correo: 'encargado@sistema.com',
    celular: '1234567894',
    rol: 'encargado_inhouse',
    password: 'encargado123'
  }
];

// Conectar a MongoDB
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Crear área de ejemplo
const crearAreaEjemplo = async (adminId) => {
  try {
    let area = await Area.findOne({ codigo: 'DEMO' });
    
    if (!area) {
      area = await Area.create({
        nombre: 'Área Demo',
        descripcion: 'Área de demostración para pruebas',
        codigo: 'DEMO',
        administrador: adminId,
        activo: true
      });
      console.log('✅ Área de ejemplo creada:', area.nombre);
    } else {
      console.log('ℹ️  Área de ejemplo ya existe:', area.nombre);
    }
    
    return area;
  } catch (error) {
    console.error('❌ Error al crear área:', error.message);
    throw error;
  }
};

// Crear usuarios
const crearUsuarios = async () => {
  try {
    console.log('\n🚀 Iniciando creación de usuarios...\n');
    
    const usuariosCreados = [];
    let area = null;
    
    // Primero crear el usuario admin para usarlo como administrador del área
    const adminData = usuariosPorRol.find(u => u.rol === 'admin');
    let adminUser = await User.findOne({ correo: adminData.correo });
    
    if (!adminUser) {
      // Crear área temporal sin administrador
      let areaTemp = await Area.findOne({ codigo: 'DEMO' });
      if (!areaTemp) {
        // Crear usuario admin primero
        adminUser = await User.create({
          ...adminData,
          area: null // Temporalmente null
        });
        console.log(`✅ Usuario creado: ${adminUser.rol} - ${adminUser.correo}`);
        
        // Crear área con el admin
        area = await crearAreaEjemplo(adminUser._id);
        
        // Actualizar el admin con el área
        adminUser.area = area._id;
        await adminUser.save();
      } else {
        area = areaTemp;
        adminUser = await User.create({
          ...adminData,
          area: area._id
        });
        console.log(`✅ Usuario creado: ${adminUser.rol} - ${adminUser.correo}`);
      }
    } else {
      console.log(`ℹ️  Usuario ya existe: ${adminUser.rol} - ${adminUser.correo}`);
      area = await Area.findById(adminUser.area);
      if (!area) {
        area = await crearAreaEjemplo(adminUser._id);
        adminUser.area = area._id;
        await adminUser.save();
      }
    }
    
    usuariosCreados.push(adminUser);
    
    // Crear el resto de usuarios
    for (const userData of usuariosPorRol) {
      if (userData.rol === 'admin') continue; // Ya creado
      
      try {
        // Verificar si el usuario ya existe
        let usuario = await User.findOne({ correo: userData.correo });
        
        if (usuario) {
          console.log(`ℹ️  Usuario ya existe: ${usuario.rol} - ${usuario.correo}`);
          usuariosCreados.push(usuario);
          continue;
        }
        
        // Crear usuario con el área
        usuario = await User.create({
          ...userData,
          area: area._id
        });
        
        usuariosCreados.push(usuario);
        console.log(`✅ Usuario creado: ${usuario.rol} - ${usuario.correo}`);
        
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Usuario duplicado: ${userData.correo}`);
        } else {
          console.error(`❌ Error al crear usuario ${userData.correo}:`, error.message);
        }
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE USUARIOS CREADOS');
    console.log('='.repeat(60));
    console.log(`\nÁrea: ${area.nombre} (${area.codigo})`);
    console.log('\nUsuarios:');
    console.log('-'.repeat(60));
    
    for (const usuario of usuariosCreados) {
      console.log(`\n👤 ${usuario.rol.toUpperCase()}`);
      console.log(`   Nombre: ${usuario.nombre} ${usuario.apellidos}`);
      console.log(`   Email: ${usuario.correo}`);
      console.log(`   Password: ${usuariosPorRol.find(u => u.correo === usuario.correo)?.password}`);
      console.log(`   Área: ${area.nombre}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Proceso completado exitosamente');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    throw error;
  }
};

// Función principal
const main = async () => {
  try {
    await conectarDB();
    await crearUsuarios();
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar script
main();
