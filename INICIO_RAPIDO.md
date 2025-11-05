# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a tener el sistema funcionando en **menos de 10 minutos**.

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v16+)
- [ ] MongoDB instalado o cuenta en MongoDB Atlas
- [ ] Cuenta de Gmail para SMTP
- [ ] Terminal abierta

---

## 📦 Paso 1: Instalar Dependencias

```bash
cd sistema-asistencia
npm run install-all
```

Esto instalará todas las dependencias del proyecto (raíz, servidor y cliente).

⏱️ **Tiempo estimado:** 2-3 minutos

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### Copiar archivo de ejemplo

```bash
cp .env.example .env
```

### Editar el archivo .env

Abre el archivo `.env` y configura:

```env
# MongoDB (usa uno de estos)
MONGO_URI=mongodb://localhost:27017/sistema-asistencia
# O MongoDB Atlas:
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sistema-asistencia

# JWT (cambia esto por algo único)
JWT_SECRET=mi_clave_super_secreta_2024

# Server
PORT=5000
NODE_ENV=development

# SMTP Gmail (configura después, opcional para empezar)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave_de_aplicacion

# Frontend
CLIENT_URL=http://localhost:3000
```

⏱️ **Tiempo estimado:** 1 minuto

---

## 🗄️ Paso 3: Iniciar MongoDB

### Opción A: MongoDB Local

```bash
# macOS (con Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Inicia MongoDB desde Servicios o ejecuta mongod.exe
```

### Opción B: MongoDB Atlas (Nube)

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster (M0 Free)
4. Obtén la URI de conexión
5. Actualiza `MONGO_URI` en `.env`

⏱️ **Tiempo estimado:** 1 minuto (local) o 5 minutos (Atlas)

---

## 👤 Paso 4: Crear Usuario Administrador

### Opción A: Script automático (Recomendado)

```bash
cd server
node scripts/createAdmin.js
```

Esto creará:
- **Correo:** admin@empresa.com
- **Contraseña:** admin123

### Opción B: Datos de prueba completos

```bash
cd server
node scripts/seedData.js
```

Esto creará:
- 1 Admin
- 2 CEOs
- 5 Usuarios
- ~150 asistencias de prueba

⏱️ **Tiempo estimado:** 30 segundos

---

## 🚀 Paso 5: Iniciar el Sistema

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

⏱️ **Tiempo estimado:** 30 segundos

---

## 🎉 Paso 6: Acceder al Sistema

### Abrir en el navegador

```
http://localhost:3000
```

### Credenciales de prueba

**Administrador:**
- Correo: `admin@empresa.com`
- Contraseña: `admin123`

**CEO:**
- Correo: `carlos.rodriguez@empresa.com`
- Contraseña: `password123`

**Usuario:**
- Correo: `juan.perez@empresa.com`
- Contraseña: `password123`

---

## 🎯 ¿Qué puedo hacer ahora?

### Como Administrador

1. **Ver Dashboard:**
   - Ve a "Dashboard"
   - Explora las estadísticas
   - Filtra por fechas y usuarios

2. **Gestionar Usuarios:**
   - Ve a "Usuarios"
   - Crea, edita o elimina usuarios
   - Asigna roles (admin, ceo, user)

3. **Exportar Datos:**
   - En el Dashboard, haz clic en "Exportar CSV"
   - Descarga el reporte de asistencias

### Como Usuario

1. **Iniciar Sesión:**
   - Tu asistencia se registra automáticamente
   - Verás un mensaje de confirmación

2. **Ver tus Asistencias:**
   - Accede a tu panel de usuario
   - Revisa tu historial de ingresos

---

## 📧 Configurar Correos (Opcional)

Para que el sistema envíe notificaciones por correo:

1. **Lee la guía completa:**
   ```bash
   cat GUIA_SMTP.md
   ```

2. **Resumen rápido:**
   - Activa verificación en dos pasos en Gmail
   - Genera una contraseña de aplicación
   - Actualiza `SMTP_USER` y `SMTP_PASS` en `.env`
   - Reinicia el servidor

---

## 🐛 Solución Rápida de Problemas

### Error: "Cannot connect to MongoDB"

```bash
# Verifica que MongoDB esté corriendo
mongosh

# O verifica tu URI en .env
```

### Error: "Port 5000 already in use"

```bash
# Cambia el puerto en .env
PORT=5001
```

### Error: "Module not found"

```bash
# Reinstala las dependencias
npm run install-all
```

### La página no carga

```bash
# Verifica que ambos servicios estén corriendo
# Backend: http://localhost:5000/api/health
# Frontend: http://localhost:3000
```

---

## 📚 Próximos Pasos

1. **Lee la documentación completa:**
   - `README.md` - Guía general
   - `DOCS.md` - Documentación técnica
   - `GUIA_SMTP.md` - Configuración de correos

2. **Personaliza el sistema:**
   - Cambia los colores en `client/tailwind.config.js`
   - Modifica textos y mensajes
   - Agrega nuevas funcionalidades

3. **Despliega en producción:**
   - Backend: Railway, Render, Heroku
   - Frontend: Vercel, Netlify
   - Base de datos: MongoDB Atlas

---

## 🆘 ¿Necesitas Ayuda?

### Recursos

- **README.md** - Documentación general
- **DOCS.md** - Documentación técnica detallada
- **GUIA_SMTP.md** - Configuración de correos

### Comandos Útiles

```bash
# Ver logs del servidor
npm run server

# Ver logs del cliente
npm run client

# Limpiar y reinstalar
rm -rf node_modules server/node_modules client/node_modules
npm run install-all

# Verificar versiones
node --version
npm --version
mongod --version
```

---

## ✨ ¡Listo!

Tu sistema de control de asistencia está funcionando. Ahora puedes:

- ✅ Registrar asistencias automáticamente
- ✅ Gestionar usuarios
- ✅ Ver estadísticas y reportes
- ✅ Exportar datos
- ✅ Recibir notificaciones por correo

**¡Disfruta del sistema!** 🎉

---

**Tiempo total de instalación:** ~10 minutos
