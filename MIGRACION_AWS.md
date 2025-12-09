# 🚀 Migración de Base de Datos a AWS

Guía completa para migrar la base de datos MongoDB local a la instancia de AWS.

## 📋 Información del Servidor

- **Host**: `ec2-52-90-132-79.compute-1.amazonaws.com`
- **Usuario**: `ec2-user`
- **Key**: `StaffEntry.pem`
- **Comando SSH**: 
  ```bash
  ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com
  ```

---

## 🔄 Proceso de Migración

### Paso 1: Exportar Base de Datos Local

Desde tu máquina local, en la carpeta del proyecto:

```bash
# Opción A: Usar mongodump directamente
mongodump --db=sistema-asistencia --out=./backup-local

# Opción B: Usar el script creado
cd server
node scripts/exportDB.js
```

Esto creará una carpeta con el backup en `server/backups/backup-[timestamp]/sistema-asistencia/`

### Paso 2: Copiar Backup al Servidor AWS

```bash
# Asegúrate de estar en la carpeta donde está StaffEntry.pem
scp -i "StaffEntry.pem" -r ./server/backups/backup-[timestamp] ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/
```

### Paso 3: Conectar al Servidor AWS

```bash
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com
```

### Paso 4: Verificar MongoDB en AWS

Una vez conectado al servidor:

```bash
# Verificar si MongoDB está instalado
mongod --version

# Verificar si está corriendo
sudo systemctl status mongod

# Si no está corriendo, iniciarlo
sudo systemctl start mongod

# Habilitar para que inicie automáticamente
sudo systemctl enable mongod
```

### Paso 5: Importar Base de Datos en AWS

```bash
# Ir a la carpeta del backup
cd ~/backup-[timestamp]

# Importar la base de datos
mongorestore --db=sistema-asistencia ./sistema-asistencia

# Verificar que se importó correctamente
mongo
> use sistema-asistencia
> show collections
> db.users.count()
> exit
```

---

## 🔧 Configuración del Proyecto

### Actualizar Variables de Entorno

En el servidor AWS, actualiza el archivo `.env`:

```bash
# Editar .env en el servidor
nano ~/sistema-asistencia/server/.env
```

Configuración para AWS:

```env
# MongoDB - Ahora apunta a localhost en AWS
MONGO_URI=mongodb://localhost:27017/sistema-asistencia

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion

# Server
PORT=5000
NODE_ENV=production

# SMTP Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave_de_aplicacion

# Frontend URL (IP pública de AWS o dominio)
CLIENT_URL=http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
```

---

## 🛡️ Seguridad de MongoDB en AWS

### Configurar Autenticación (Recomendado)

```bash
# Conectar a MongoDB
mongo

# Crear usuario administrador
use admin
db.createUser({
  user: "admin",
  pwd: "password_super_seguro_aqui",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Crear usuario para la aplicación
use sistema-asistencia
db.createUser({
  user: "asistencia_app",
  pwd: "password_app_seguro",
  roles: [ { role: "readWrite", db: "sistema-asistencia" } ]
})

exit
```

### Habilitar Autenticación

```bash
# Editar configuración de MongoDB
sudo nano /etc/mongod.conf

# Agregar/modificar:
security:
  authorization: enabled

# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Actualizar URI de Conexión con Autenticación

```env
MONGO_URI=mongodb://asistencia_app:password_app_seguro@localhost:27017/sistema-asistencia?authSource=sistema-asistencia
```

---

## 🔥 Configurar Firewall (Security Groups en AWS)

En la consola de AWS EC2:

1. Ve a tu instancia EC2
2. Security Groups → Editar reglas de entrada
3. Agregar reglas:

```
- Type: Custom TCP
  Port: 5000
  Source: 0.0.0.0/0 (o tu IP específica)
  Description: Node.js Backend

- Type: Custom TCP
  Port: 3000
  Source: 0.0.0.0/0 (o tu IP específica)
  Description: React Frontend

- Type: SSH
  Port: 22
  Source: Tu IP
  Description: SSH Access

- Type: Custom TCP
  Port: 27017
  Source: 127.0.0.1/32 (solo localhost)
  Description: MongoDB (NO exponer públicamente)
```

---

## 🚀 Desplegar la Aplicación en AWS

### Instalar Dependencias en el Servidor

```bash
# Conectar al servidor
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# Instalar Node.js si no está instalado
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2 para gestionar procesos
sudo npm install -g pm2

# Clonar o copiar el proyecto
# Si usas git:
git clone <tu-repositorio>
cd sistema-asistencia

# O copiar archivos:
# Desde tu máquina local:
scp -i "StaffEntry.pem" -r ./sistema-asistencia ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/
```

### Instalar Dependencias del Proyecto

```bash
cd ~/sistema-asistencia

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
npm run build

cd ..
```

### Iniciar con PM2

```bash
# Iniciar backend
cd ~/sistema-asistencia/server
pm2 start index.js --name "asistencia-backend"

# Servir frontend con serve
cd ~/sistema-asistencia/client
pm2 serve build 3000 --name "asistencia-frontend" --spa

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Ejecutar el comando que PM2 te muestra
```

### Verificar que Todo Funciona

```bash
# Ver logs
pm2 logs

# Ver estado
pm2 status

# Reiniciar si es necesario
pm2 restart all
```

---

## 🔍 Verificación Final

### Probar Backend

```bash
# Desde el servidor
curl http://localhost:5000/api/health

# Desde tu navegador
http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api/health
```

### Probar Frontend

```
http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
```

---

## 📊 Comandos Útiles

### MongoDB

```bash
# Backup manual
mongodump --db=sistema-asistencia --out=/home/ec2-user/backups/$(date +%Y%m%d)

# Restaurar backup
mongorestore --db=sistema-asistencia /path/to/backup/sistema-asistencia

# Ver logs de MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Conectar a MongoDB
mongo sistema-asistencia
```

### PM2

```bash
# Ver procesos
pm2 list

# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicación
pm2 restart asistencia-backend
pm2 restart asistencia-frontend

# Detener aplicación
pm2 stop all

# Eliminar de PM2
pm2 delete asistencia-backend
```

### Sistema

```bash
# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver memoria
free -h
```

---

## 🔄 Script de Backup Automático

Crear un cron job para backups automáticos:

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * mongodump --db=sistema-asistencia --out=/home/ec2-user/backups/$(date +\%Y\%m\%d) && find /home/ec2-user/backups -type d -mtime +7 -exec rm -rf {} +
```

---

## ⚠️ Troubleshooting

### MongoDB no conecta

```bash
# Verificar que está corriendo
sudo systemctl status mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar
sudo systemctl restart mongod
```

### Aplicación no responde

```bash
# Ver logs de PM2
pm2 logs

# Reiniciar
pm2 restart all

# Verificar puertos
sudo netstat -tulpn | grep -E ':(3000|5000|27017)'
```

### Error de permisos

```bash
# Dar permisos a la carpeta del proyecto
sudo chown -R ec2-user:ec2-user ~/sistema-asistencia
```

---

## 📞 Contacto

Para soporte adicional:
- Documentación MongoDB: https://docs.mongodb.com/
- PM2 Documentation: https://pm2.keymetrics.io/

---

*Guía de migración - Sistema de Asistencia v1.0*
