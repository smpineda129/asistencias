# 🚀 Cómo Levantar el Proyecto

## ⚡ Inicio Rápido

### 1. Levantar Todo (Backend + Frontend)

```bash
npm run dev
```

Eso es todo! Este comando levanta:
- **Backend** en `http://localhost:5001`
- **Frontend** en `http://localhost:3000`

---

## 📋 Requisitos Previos

### Primera Vez (Solo una vez)

1. **Instalar dependencias:**
```bash
# En la raíz del proyecto
npm install

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

2. **MongoDB debe estar corriendo:**
```bash
# Si tienes MongoDB local
mongod

# O con Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

3. **Configurar variables de entorno:**
```bash
# Copiar el ejemplo
cp server/.env.example server/.env

# Editar server/.env y configurar:
# - MONGO_URI
# - JWT_SECRET
# - BIOMETRIC_ENCRYPTION_KEY (para el sistema de huellas)
```

---

## 🎯 Comandos Disponibles

### Levantar Todo
```bash
npm run dev
```

### Solo Backend
```bash
npm run server
# o
cd server && npm run dev
```

### Solo Frontend
```bash
npm run client
# o
cd client && npm start
```

---

## 🌐 URLs del Sistema

Una vez levantado:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **Swagger Docs:** http://localhost:5001/api-docs
- **Terminal Biométrico:** http://localhost:3000/terminal

---

## 🔐 Usuarios por Defecto

Si ejecutaste el script de seed (`npm run seed` en server/):

**Administrador:**
- Email: `admin@empresa.com`
- Password: `admin123`

**CEO:**
- Email: `ceo@empresa.com`
- Password: `ceo123`

**Usuario:**
- Email: `usuario@empresa.com`
- Password: `user123`

---

## ⚠️ Advertencias Comunes

### "BIOMETRIC_ENCRYPTION_KEY no encontrado"
Es normal si no has configurado el sistema biométrico aún. El sistema funciona igual, solo usa una clave por defecto (no segura para producción).

Para arreglarlo:
```bash
# En server/.env agregar:
BIOMETRIC_ENCRYPTION_KEY=tu-clave-super-secreta-de-32-caracteres-o-mas
```

### Warnings de React
Los warnings de ESLint sobre `useEffect` dependencies son normales y no afectan el funcionamiento. Son solo sugerencias de optimización.

---

## 🛑 Detener el Sistema

Presiona `Ctrl + C` en la terminal donde corriste `npm run dev`

---

## 🔄 Reiniciar

Si hiciste cambios:

**Backend:** Se reinicia automáticamente (nodemon)
**Frontend:** Se recarga automáticamente (hot reload)

Si algo no funciona, detén todo (`Ctrl + C`) y vuelve a ejecutar:
```bash
npm run dev
```

---

## 📱 Acceder desde Otro Dispositivo

Para acceder desde tu celular o tablet en la misma red:

1. Obtén tu IP local:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Accede desde el otro dispositivo:
```
http://TU_IP:3000
```

Ejemplo: `http://192.168.1.100:3000`

---

## 🐛 Problemas Comunes

### Puerto 3000 o 5001 ya en uso

**Solución:**
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# Matar proceso en puerto 5001
lsof -ti:5001 | xargs kill -9
```

### MongoDB no conecta

**Verificar que esté corriendo:**
```bash
# Ver procesos de MongoDB
ps aux | grep mongo

# Iniciar MongoDB
mongod
```

### "Cannot find module"

**Reinstalar dependencias:**
```bash
# Limpiar y reinstalar
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

---

## ✅ Verificar que Todo Funciona

1. ✅ Backend corriendo: Abre http://localhost:5001/api/health
   - Debe mostrar: `{"status":"OK","message":"Sistema de asistencia funcionando correctamente"}`

2. ✅ Frontend corriendo: Abre http://localhost:3000
   - Debe mostrar la página de login

3. ✅ MongoDB conectado: En la terminal del backend debe decir:
   - `✅ Conectado a MongoDB`

---

¡Listo! Tu sistema está corriendo. 🎉
