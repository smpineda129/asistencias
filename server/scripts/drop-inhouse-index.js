const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('inhouses');

    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('\n📋 Índices actuales:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Eliminar el índice correo_1 si existe
    try {
      await collection.dropIndex('correo_1');
      console.log('\n✅ Índice correo_1 eliminado exitosamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  El índice correo_1 no existe (ya fue eliminado)');
      } else {
        throw error;
      }
    }

    // Listar índices después de eliminar
    const indexesAfter = await collection.indexes();
    console.log('\n📋 Índices después de eliminar:');
    indexesAfter.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropIndex();
