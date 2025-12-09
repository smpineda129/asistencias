/**
 * Script para crear usuarios de prueba con todos los roles del sistema
 * 
 * Roles disponibles:
 * - admin: Administrador del sistema
 * - user: Usuario regular
 * - ceo: CEO de la empresa
 * - admin_area: Administrador de área
 * - encargado_inhouse: Encargado de InHouse
 * 
 * Uso: node scripts/seed-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Area = require('../models/Area');
const InHouse = require('../models/InHouse');

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

// Crear InHouse de ejemplo
const crearInHouseEjemplo = async (areaId, encargadoId) => {
  try {
    let inHouse = await InHouse.findOne({ nombre: 'InHouse Demo' });
    
    if (!inHouse) {
      // Crear InHouse sin usar create() para evitar problemas con índices
      inHouse = new InHouse({
        nombre: 'InHouse Demo',
        areas: [areaId],
        ubicacion: {
          direccion: 'Calle Demo 123, Ciudad',
          coordenadas: {
            lat: 19.432608,
            lng: -99.133209
          },
          radioPermitido: 100
        },
        encargado: encargadoId,
        usuariosAsignados: [],
        activo: true,
        permisos: {
          verTiempoReal: true,
          verHistorial: true,
          exportarReportes: true
        }
      });
      
      // Guardar sin validar índices geoespaciales
      await inHouse.save({ validateBeforeSave: true });
      console.log('✅ InHouse de ejemplo creado:', inHouse.nombre);
    } else {
      console.log('ℹ️  InHouse de ejemplo ya existe:', inHouse.nombre);
    }
    
    return inHouse;
  } catch (error) {
    console.error('⚠️  No se pudo crear InHouse (puede ser por índices geoespaciales):', error.message);
    console.log('ℹ️  Continuando sin InHouse - Los usuarios se crearán correctamente');
    return null;
  }
};

// Crear usuarios
const crearUsuarios = async () => {
  try {
    console.log('\n🚀 Iniciando creación de usuarios...\n');
    
    const usuariosCreados = [];
    let area = null;
    let inHouse = null;
    
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
    
    // Crear InHouse con el encargado
    const encargado = usuariosCreados.find(u => u.rol === 'encargado_inhouse');
    if (encargado) {
      inHouse = await crearInHouseEjemplo(area._id, encargado._id);
      
      // Solo actualizar relaciones si el InHouse se creó exitosamente
      if (inHouse) {
        // Actualizar el encargado con el InHouse
        encargado.inHouseEncargado = inHouse._id;
        encargado.inHousesAsignados = [inHouse._id];
        await encargado.save();
        
        // Asignar usuarios al InHouse
        const usuariosParaAsignar = usuariosCreados.filter(u => 
          u.rol === 'user' || u.rol === 'encargado_inhouse'
        );
        
        for (const usuario of usuariosParaAsignar) {
          if (!inHouse.usuariosAsignados.includes(usuario._id)) {
            inHouse.usuariosAsignados.push(usuario._id);
          }
          if (!usuario.inHousesAsignados.includes(inHouse._id)) {
            usuario.inHousesAsignados.push(inHouse._id);
            await usuario.save();
          }
        }
        
        await inHouse.save();
        console.log(`✅ Usuarios asignados al InHouse: ${usuariosParaAsignar.length}`);
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE USUARIOS CREADOS');
    console.log('='.repeat(60));
    console.log(`\nÁrea: ${area.nombre} (${area.codigo})`);
    if (inHouse) {
      console.log(`InHouse: ${inHouse.nombre}`);
    }
    console.log('\nUsuarios:');
    console.log('-'.repeat(60));
    
    for (const usuario of usuariosCreados) {
      console.log(`\n👤 ${usuario.rol.toUpperCase()}`);
      console.log(`   Nombre: ${usuario.nombre} ${usuario.apellidos}`);
      console.log(`   Email: ${usuario.correo}`);
      console.log(`   Password: ${usuariosPorRol.find(u => u.correo === usuario.correo)?.password}`);
      console.log(`   Área: ${area.nombre}`);
      if (usuario.inHouseEncargado) {
        console.log(`   InHouse a cargo: ${inHouse?.nombre}`);
      }
      if (usuario.inHousesAsignados.length > 0) {
        console.log(`   InHouses asignados: ${usuario.inHousesAsignados.length}`);
      }
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
