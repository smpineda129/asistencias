const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const DB_NAME = 'sistema-asistencia';
const BACKUP_DIR = path.join(__dirname, '../backups');
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const BACKUP_PATH = path.join(BACKUP_DIR, `backup-${TIMESTAMP}`);

console.log('📦 Exportando base de datos local...\n');

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Directorio de backups creado\n');
}

// Comando para exportar la base de datos
const command = `mongodump --db=${DB_NAME} --out="${BACKUP_PATH}"`;

console.log(`🔄 Ejecutando: ${command}\n`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al exportar:', error.message);
    return;
  }
  
  if (stderr) {
    console.log('⚠️  Advertencias:', stderr);
  }
  
  console.log(stdout);
  console.log('✅ Base de datos exportada exitosamente!\n');
  console.log('📁 Ubicación:', BACKUP_PATH);
  console.log('\n📋 Siguiente paso:');
  console.log('   1. Copia la carpeta de backup al servidor AWS');
  console.log('   2. Ejecuta el script de importación en AWS\n');
  console.log('💡 Comando para copiar al servidor:');
  console.log(`   scp -i "StaffEntry.pem" -r "${BACKUP_PATH}" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/`);
});
