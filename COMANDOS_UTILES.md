# 🛠️ Comandos Útiles - AWS & GitHub Actions

Referencia rápida de comandos para gestionar tu aplicación.

---

## 🔑 SSH - Conectar al Servidor

```bash
# Conectar al servidor AWS
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# Conectar y ejecutar comando directo
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "pm2 status"
```

---

## 📦 PM2 - Gestión de Procesos

### Ver Estado
```bash
pm2 status                    # Ver todas las apps
pm2 list                      # Igual que status
pm2 show asistencia-backend   # Detalles de una app
```

### Ver Logs
```bash
pm2 logs                      # Ver logs de todas las apps
pm2 logs asistencia-backend   # Logs solo del backend
pm2 logs asistencia-frontend  # Logs solo del frontend
pm2 logs --lines 100          # Ver últimas 100 líneas
```

### Reiniciar
```bash
pm2 restart all               # Reiniciar todas las apps
pm2 restart asistencia-backend
pm2 restart asistencia-frontend
```

### Detener/Iniciar
```bash
pm2 stop all                  # Detener todas
pm2 stop asistencia-backend
pm2 start asistencia-backend
```

### Eliminar
```bash
pm2 delete all                # Eliminar todas
pm2 delete asistencia-backend
```

### Monitoreo
```bash
pm2 monit                     # Monitor en tiempo real (CPU, RAM)
```

---

## 🗄️ MongoDB - Base de Datos

### Conectar a MongoDB
```bash
mongo
# o
mongo sistema-asistencia
```

### Comandos Básicos
```javascript
// Ver bases de datos
show dbs

// Usar base de datos
use sistema-asistencia

// Ver colecciones
show collections

// Contar documentos
db.users.count()
db.attendances.count()

// Ver usuarios
db.users.find().pretty()

// Ver último registro
db.attendances.find().sort({_id:-1}).limit(1).pretty()

// Salir
exit
```

### Backup
```bash
# Crear backup
mongodump --db=sistema-asistencia --out=~/backup-$(date +%Y%m%d)

# Restaurar backup
mongorestore --db=sistema-asistencia ~/backup-20231208/sistema-asistencia
```

---

## 📊 Sistema - Monitoreo

### Ver Recursos
```bash
# CPU y RAM en tiempo real
htop

# Espacio en disco
df -h

# Memoria
free -h

# Procesos que más consumen
top
```

### Ver Puertos
```bash
# Ver qué está usando cada puerto
sudo netstat -tulpn | grep LISTEN

# Ver puerto específico
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5000
```

### Ver Logs del Sistema
```bash
# Logs de MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Logs del sistema
sudo tail -f /var/log/messages
```

---

## 🔄 Git - Control de Versiones

### Workflow Normal
```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar cambios
git add .
git add archivo.js

# Commit
git commit -m "Descripción del cambio"

# Push (esto dispara el CI/CD)
git push origin main

# Ver historial
git log --oneline
```

### Branches
```bash
# Ver branches
git branch

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar de branch
git checkout main

# Mergear
git merge feature/nueva-funcionalidad
```

### Deshacer Cambios
```bash
# Deshacer cambios no commiteados
git checkout -- archivo.js

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1
```

---

## 🚀 GitHub Actions

### Ver Workflows
```bash
# En GitHub web:
# Tu Repo → Actions
```

### Re-ejecutar Workflow Fallido
1. Ve a Actions
2. Click en el workflow fallido
3. Click en "Re-run jobs"

### Cancelar Workflow
1. Ve a Actions
2. Click en el workflow corriendo
3. Click en "Cancel workflow"

---

## 📁 Archivos - Copiar/Descargar

### Copiar Archivo Local → AWS
```bash
scp -i "StaffEntry.pem" archivo.txt ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/
```

### Copiar Carpeta Local → AWS
```bash
scp -i "StaffEntry.pem" -r carpeta/ ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/
```

### Descargar Archivo AWS → Local
```bash
scp -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/archivo.txt ./
```

### Descargar Backup
```bash
scp -i "StaffEntry.pem" -r ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com:~/backup-20231208 ./
```

---

## 🔧 Mantenimiento

### Limpiar Espacio en Disco
```bash
# Ver qué ocupa más espacio
du -sh ~/* | sort -h

# Limpiar backups antiguos (mantener últimos 3)
cd ~
ls -dt sistema-asistencia-backup-* | tail -n +4 | xargs rm -rf

# Limpiar logs de PM2
pm2 flush

# Limpiar logs de MongoDB (con cuidado)
sudo rm -f /var/log/mongodb/mongod.log.*
```

### Actualizar Node.js
```bash
# Ver versión actual
node --version

# Actualizar con nvm
nvm install 18
nvm use 18
```

### Actualizar PM2
```bash
sudo npm install -g pm2@latest
pm2 update
```

---

## 🐛 Troubleshooting

### App no responde
```bash
# 1. Ver logs
pm2 logs

# 2. Ver estado
pm2 status

# 3. Reiniciar
pm2 restart all

# 4. Si no funciona, eliminar y volver a crear
pm2 delete all
cd ~/sistema-asistencia/server
pm2 start index.js --name asistencia-backend
cd ../client
pm2 serve build 3000 --name asistencia-frontend --spa
pm2 save
```

### MongoDB no conecta
```bash
# Ver estado
sudo systemctl status mongod

# Iniciar
sudo systemctl start mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Puerto ocupado
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000
sudo lsof -i :5000

# Matar proceso
sudo kill -9 <PID>
```

### Sin espacio en disco
```bash
# Ver espacio
df -h

# Limpiar
pm2 flush
sudo journalctl --vacuum-time=3d
rm -rf ~/sistema-asistencia-backup-*
```

---

## 🔐 Seguridad

### Cambiar Permisos de .pem
```bash
chmod 400 StaffEntry.pem
```

### Ver Intentos de Login Fallidos
```bash
sudo grep "Failed password" /var/log/secure | tail -20
```

### Actualizar Sistema
```bash
sudo yum update -y
```

---

## 📊 Monitoreo Avanzado

### Ver Conexiones Activas
```bash
# Conexiones a MongoDB
mongo --eval "db.serverStatus().connections"

# Conexiones HTTP
sudo netstat -an | grep :5000 | grep ESTABLISHED | wc -l
```

### Ver Uso de CPU por Proceso
```bash
ps aux --sort=-%cpu | head -10
```

### Ver Uso de Memoria por Proceso
```bash
ps aux --sort=-%mem | head -10
```

---

## 🎯 Comandos de Un Solo Uso

### Deployment Manual (sin GitHub Actions)
```bash
./deploy-aws.sh
```

### Migración de BD
```bash
./migrate-to-aws.sh
```

### Backup Rápido
```bash
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com \
  "mongodump --db=sistema-asistencia --out=~/backup-$(date +%Y%m%d)"
```

### Ver Logs en Tiempo Real (desde local)
```bash
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com "pm2 logs"
```

---

## 📞 URLs Importantes

- **Frontend**: http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
- **Backend**: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000
- **Health Check**: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api/health
- **Swagger**: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api-docs
- **GitHub Actions**: https://github.com/tu-usuario/sistema-asistencia/actions

---

*Guarda este archivo como referencia rápida* 📖
