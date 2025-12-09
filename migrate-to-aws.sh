#!/bin/bash

# Script de migración a AWS
# Uso: ./migrate-to-aws.sh

set -e

echo "🚀 Migración de Base de Datos a AWS"
echo "===================================="
echo ""

# Variables
DB_NAME="sistema-asistencia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./server/backups"
BACKUP_NAME="backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
AWS_HOST="ec2-52-90-132-79.compute-1.amazonaws.com"
AWS_USER="ec2-user"
KEY_FILE="StaffEntry.pem"

# Verificar que existe la key
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $KEY_FILE"
    echo "   Asegúrate de que StaffEntry.pem esté en la carpeta actual"
    exit 1
fi

# Paso 1: Exportar base de datos local
echo "📦 Paso 1: Exportando base de datos local..."
mkdir -p "$BACKUP_DIR"
mongodump --db="$DB_NAME" --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos exportada exitosamente"
else
    echo "❌ Error al exportar la base de datos"
    exit 1
fi

# Paso 2: Copiar backup al servidor AWS
echo ""
echo "📤 Paso 2: Copiando backup al servidor AWS..."
scp -i "$KEY_FILE" -r "$BACKUP_PATH" "${AWS_USER}@${AWS_HOST}:~/"

if [ $? -eq 0 ]; then
    echo "✅ Backup copiado exitosamente al servidor"
else
    echo "❌ Error al copiar el backup"
    exit 1
fi

# Paso 3: Importar en AWS
echo ""
echo "📥 Paso 3: Importando base de datos en AWS..."
ssh -i "$KEY_FILE" "${AWS_USER}@${AWS_HOST}" << EOF
    echo "🔄 Importando base de datos..."
    mongorestore --db="$DB_NAME" ~/${BACKUP_NAME}/${DB_NAME}
    
    if [ \$? -eq 0 ]; then
        echo "✅ Base de datos importada exitosamente"
        
        echo ""
        echo "📊 Verificando datos importados..."
        mongo "$DB_NAME" --eval "
            print('Colecciones:');
            db.getCollectionNames().forEach(function(col) {
                print('  - ' + col + ': ' + db[col].count() + ' documentos');
            });
        "
        
        echo ""
        echo "🧹 Limpiando backup temporal..."
        rm -rf ~/${BACKUP_NAME}
        echo "✅ Backup temporal eliminado"
    else
        echo "❌ Error al importar la base de datos"
        exit 1
    fi
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Migración completada exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Actualizar el archivo .env en el servidor AWS"
    echo "   2. Configurar autenticación de MongoDB (recomendado)"
    echo "   3. Desplegar la aplicación"
    echo ""
    echo "📖 Ver guía completa: MIGRACION_AWS.md"
else
    echo "❌ Error durante la importación"
    exit 1
fi
