require('dotenv').config();
const mongoose = require('mongoose');
const InHouse = require('../models/InHouse');
const User = require('../models/User.model');

const migrateInHouses = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📋 Buscando InHouses con formato antiguo...');
    const inHouses = await InHouse.find();
    
    console.log(`Encontrados ${inHouses.length} InHouses\n`);

    for (const inHouse of inHouses) {
      console.log(`\n🔧 Procesando: ${inHouse.nombre}`);
      console.log(`   Encargado actual: ${inHouse.encargado} (${typeof inHouse.encargado})`);
      
      // Buscar un usuario del área para asignar como encargado
      const area = inHouse.areas && inHouse.areas.length > 0 ? inHouse.areas[0] : null;
      
      if (area) {
        console.log(`   Buscando usuario en área: ${area}`);
        const usuario = await User.findOne({ area: area, activo: true }).limit(1);
        
        if (usuario) {
          console.log(`   ✅ Asignando usuario: ${usuario.nombre} ${usuario.apellidos} (${usuario._id})`);
          
          // Actualizar usuario
          usuario.rol = 'encargado_inhouse';
          usuario.inHouseEncargado = inHouse._id;
          await usuario.save();
          
          // Actualizar InHouse directamente en la base de datos
          await InHouse.updateOne(
            { _id: inHouse._id },
            { 
              $set: { encargado: usuario._id },
              $unset: { correo: "", password: "" }
            }
          );
          
          console.log(`   ✅ Migrado correctamente`);
        } else {
          console.log(`   ❌ No se encontró usuario en el área`);
        }
      } else {
        console.log(`   ❌ InHouse sin áreas asignadas`);
      }
    }

    console.log('\n\n🎉 Migración completada!');
    console.log('📊 Resumen:');
    const migrados = await InHouse.find().populate('encargado', 'nombre apellidos');
    migrados.forEach(ih => {
      console.log(`   - ${ih.nombre}: ${ih.encargado?.nombre || 'SIN ENCARGADO'} ${ih.encargado?.apellidos || ''}`);
    });

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
};

// Ejecutar
migrateInHouses();
