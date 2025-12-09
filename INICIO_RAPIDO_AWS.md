# ⚡ Inicio Rápido - Despliegue en AWS

Guía rápida para desplegar el sistema en AWS en 3 pasos.

## 📋 Pre-requisitos

1. ✅ Archivo `StaffEntry.pem` en la carpeta raíz del proyecto
2. ✅ MongoDB instalado localmente con datos
3. ✅ Acceso SSH al servidor AWS

---

## 🚀 Opción 1: Migración Automática (Recomendado)

### Un solo comando para migrar la BD:

```bash
./migrate-to-aws.sh
```

Este script:
- ✅ Exporta tu BD local
- ✅ La copia al servidor AWS
- ✅ La importa en MongoDB de AWS
- ✅ Verifica que todo esté correcto

---

## 🚀 Opción 2: Migración Manual

### Paso 1: Exportar BD Local

```bash
mongodump --db=sistema-asistencia --out=./backup-local
```

### Paso 2: Copiar al Servidor

```bash
scp -i "StaffEntry.pem" -r ./backup-local ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/
```

### Paso 3: Conectar y Importar

```bash
# Conectar al servidor
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# Importar BD
mongorestore --db=sistema-asistencia ./backup-local/sistema-asistencia

# Verificar
mongo sistema-asistencia --eval "db.users.count()"
```

---

## 🎯 Desplegar la Aplicación

### Opción A: Script Automático

```bash
./deploy-aws.sh
```

### Opción B: Manual

```bash
# 1. Copiar archivos
scp -i "StaffEntry.pem" -r ./sistema-asistencia ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/

# 2. Conectar al servidor
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# 3. Instalar dependencias
cd ~/sistema-asistencia/server
npm install

cd ../client
npm install
npm run build

# 4. Iniciar con PM2
cd ~/sistema-asistencia/server
pm2 start index.js --name asistencia-backend

cd ../client
pm2 serve build 3000 --name asistencia-frontend --spa

pm2 save
```

---

## 🔧 Configurar Variables de Entorno

En el servidor AWS:

```bash
# Editar .env
nano ~/sistema-asistencia/server/.env
```

Configuración mínima:

```env
MONGO_URI=mongodb://localhost:27017/sistema-asistencia
JWT_SECRET=tu_clave_secreta_cambiar_en_produccion
PORT=5000
NODE_ENV=production
CLIENT_URL=http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
```

---

## ✅ Verificar que Funciona

### Desde el navegador:

- **Frontend**: http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
- **Backend**: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api/health
- **Swagger**: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api-docs

### Desde SSH:

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart all
```

---

## 🔥 Configurar Security Groups en AWS

En la consola de AWS EC2:

1. Selecciona tu instancia
2. Security → Security Groups → Edit inbound rules
3. Agregar reglas:

```
Puerto 22   (SSH)     - Tu IP
Puerto 3000 (Frontend) - 0.0.0.0/0
Puerto 5000 (Backend)  - 0.0.0.0/0
```

---

## 📊 Comandos Útiles

```bash
# Ver logs en tiempo real
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "pm2 logs"

# Ver estado
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "pm2 status"

# Reiniciar aplicación
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "pm2 restart all"

# Backup de BD
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "mongodump --db=sistema-asistencia --out=~/backup-\$(date +%Y%m%d)"
```

---

## ⚠️ Problemas Comunes

### MongoDB no conecta
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

### Aplicación no responde
```bash
pm2 logs
pm2 restart all
```

### Puerto en uso
```bash
sudo netstat -tulpn | grep -E ':(3000|5000)'
pm2 delete all
pm2 start ...
```

---

## 📚 Documentación Completa

- **Guía detallada**: [MIGRACION_AWS.md](./MIGRACION_AWS.md)
- **Configuración**: [server/.env.aws.example](./server/.env.aws.example)

---

*¡Listo! Tu aplicación está en AWS* 🎉
