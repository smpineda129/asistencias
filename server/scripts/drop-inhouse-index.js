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

    // Eliminar el índice geoespacial antiguo si existe
    try {
      await collection.dropIndex('ubicacion.coordenadas_2dsphere');
      console.log('\n✅ Índice ubicacion.coordenadas_2dsphere eliminado exitosamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  El índice ubicacion.coordenadas_2dsphere no existe');
      } else {
        throw error;
      }
    }

    // Eliminar todos los InHouses existentes (tienen formato antiguo)
    const deleteResult = await collection.deleteMany({});
    console.log(`\n🗑️  Eliminados ${deleteResult.deletedCount} InHouses con formato antiguo`);

    // Listar índices después de eliminar
    const indexesAfter = await collection.indexes();
    console.log('\n📋 Índices después de limpiar:');
    indexesAfter.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Proceso completado - Ahora puedes crear InHouses con el nuevo formato GeoJSON');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropIndex();
