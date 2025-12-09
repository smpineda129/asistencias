#!/bin/bash

# Script de despliegue en AWS
# Uso: ./deploy-aws.sh

set -e

echo "🚀 Despliegue en AWS"
echo "===================="
echo ""

# Variables
AWS_HOST="ec2-52-90-132-79.compute-1.amazonaws.com"
AWS_USER="ec2-user"
KEY_FILE="StaffEntry.pem"
PROJECT_NAME="sistema-asistencia"

# Verificar que existe la key
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $KEY_FILE"
    exit 1
fi

echo "📦 Paso 1: Copiando archivos al servidor..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude 'backups' \
           --exclude '.env' \
           -e "ssh -i $KEY_FILE" \
           ./ "${AWS_USER}@${AWS_HOST}:~/${PROJECT_NAME}/"

if [ $? -eq 0 ]; then
    echo "✅ Archivos copiados exitosamente"
else
    echo "❌ Error al copiar archivos"
    exit 1
fi

echo ""
echo "🔧 Paso 2: Instalando dependencias y desplegando..."
ssh -i "$KEY_FILE" "${AWS_USER}@${AWS_HOST}" << 'EOF'
    cd ~/sistema-asistencia
    
    echo "📦 Instalando dependencias del servidor..."
    cd server
    npm install --production
    
    echo "📦 Instalando dependencias del cliente..."
    cd ../client
    npm install
    
    echo "🏗️  Construyendo aplicación React..."
    npm run build
    
    echo "🔄 Reiniciando aplicaciones con PM2..."
    cd ~/sistema-asistencia/server
    
    # Verificar si PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        echo "📥 Instalando PM2..."
        sudo npm install -g pm2
    fi
    
    # Detener procesos anteriores si existen
    pm2 delete asistencia-backend 2>/dev/null || true
    pm2 delete asistencia-frontend 2>/dev/null || true
    
    # Iniciar backend
    pm2 start index.js --name "asistencia-backend"
    
    # Iniciar frontend
    cd ../client
    pm2 serve build 3000 --name "asistencia-frontend" --spa
    
    # Guardar configuración
    pm2 save
    
    # Configurar inicio automático
    pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true
    
    echo ""
    echo "📊 Estado de las aplicaciones:"
    pm2 status
    
    echo ""
    echo "✅ Despliegue completado!"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Aplicación desplegada exitosamente!"
    echo ""
    echo "🌐 URLs de acceso:"
    echo "   Frontend: http://${AWS_HOST}:3000"
    echo "   Backend:  http://${AWS_HOST}:5000/api/health"
    echo "   Swagger:  http://${AWS_HOST}:5000/api-docs"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver logs:     ssh -i $KEY_FILE ${AWS_USER}@${AWS_HOST} 'pm2 logs'"
    echo "   Ver estado:   ssh -i $KEY_FILE ${AWS_USER}@${AWS_HOST} 'pm2 status'"
    echo "   Reiniciar:    ssh -i $KEY_FILE ${AWS_USER}@${AWS_HOST} 'pm2 restart all'"
else
    echo "❌ Error durante el despliegue"
    exit 1
fi
