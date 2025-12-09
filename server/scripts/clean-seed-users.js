/**
 * Script para limpiar usuarios de prueba creados por seed-users.js
 * 
 * Uso: node scripts/clean-seed-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Area = require('../models/Area');
const InHouse = require('../models/InHouse');

// Correos de usuarios de prueba
const correosUsuariosPrueba = [
  'admin@sistema.com',
  'user@sistema.com',
  'ceo@sistema.com',
  'adminarea@sistema.com',
  'encargado@sistema.com'
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

// Limpiar datos de prueba
const limpiarDatos = async () => {
  try {
    console.log('\n🧹 Iniciando limpieza de datos de prueba...\n');
    
    // Eliminar usuarios de prueba
    const resultadoUsuarios = await User.deleteMany({
      correo: { $in: correosUsuariosPrueba }
    });
    console.log(`✅ Usuarios eliminados: ${resultadoUsuarios.deletedCount}`);
    
    // Eliminar área de prueba
    const resultadoArea = await Area.deleteMany({
      codigo: 'DEMO'
    });
    console.log(`✅ Áreas eliminadas: ${resultadoArea.deletedCount}`);
    
    // Eliminar InHouse de prueba
    const resultadoInHouse = await InHouse.deleteMany({
      nombre: 'InHouse Demo'
    });
    console.log(`✅ InHouses eliminados: ${resultadoInHouse.deletedCount}`);
    
    console.log('\n✅ Limpieza completada exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
    throw error;
  }
};

// Función principal
const main = async () => {
  try {
    await conectarDB();
    await limpiarDatos();
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada\n');
    process.exit(0);
  }
};

// Ejecutar script
main();
