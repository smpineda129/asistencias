# 📋 Sistema de Control de Asistencia del Personal

Sistema web completo para el control y registro de asistencia del personal con ingreso/salida, desarrollado con React, Node.js, Express y MongoDB.

## 🎯 Características Principales

### ✨ Gestión de Asistencias
- ⏰ **Registro manual de ingreso/salida** - Los usuarios marcan su entrada y salida durante el día
- 🔄 **Múltiples ingresos por día** - Permite registrar varias entradas/salidas
- 🏢 **Registro por In House** - Usuarios marcan asistencia en empresas específicas
- 📊 **Estados en tiempo real** - Visualiza quién está activo y quién no
- 📈 **Historial completo** - Registro detallado con hora de ingreso, salida y estado

### 👥 Gestión de Usuarios
- 🔐 **Autenticación JWT** con roles (admin, user, ceo)
- 👤 **CRUD completo de usuarios** (solo administradores)
- 🎭 **3 roles diferenciados**: Admin, CEO y Usuario
- ✅ **Activación/desactivación** de cuentas

### 📊 Dashboard y Analytics
- 📈 **Gráficas interactivas** de asistencias por día
- 🏆 **Top usuarios** por asistencias
- 📋 **Tabla paginada** (10 registros por página)
- 🔍 **Filtros avanzados** por fecha, usuario y rango
- 📅 **Filtro rápido "Hoy"** para ver asistencias actuales
- 💾 **Exportación a CSV** de registros

### ⚡ Panel en Tiempo Real
- 🟢 **Usuarios activos** - Muestra quién tiene ingreso sin salida
- 🔴 **Usuarios inactivos** - Muestra quién no ha ingresado
- 🔢 **Contador de ingresos** - Total de ingresos por usuario en el día
- 🔄 **Auto-actualización** cada 10 segundos
- 📊 **Estadísticas en vivo** - Porcentaje de asistencia, totales, etc.

### 🎨 Interfaz y UX
- 💅 **Diseño moderno** con TailwindCSS
- 🎭 **Animaciones suaves** y transiciones
- 📱 **Totalmente responsive** para móviles y tablets
- 🌈 **Paleta de colores** profesional y accesible
- 🔔 **Notificaciones toast** para feedback inmediato

### 🔐 Sistema Biométrico (NUEVO)
- 👆 **Lector de Huellas** - Integración con DigitalPersona U.are.U 4500
- 🔒 **Registro de Huellas** - Hasta 10 dedos por usuario
- ⚡ **Verificación Rápida** - Marcación en menos de 2 segundos
- 🖥️ **Terminal de Marcación** - Interfaz dedicada para control de acceso
- 🔐 **Encriptación AES-256** - Templates biométricos seguros
- 📊 **Estadísticas de Uso** - Monitoreo de huellas registradas

### 🔧 Características Técnicas
- 📡 **API RESTful** documentada con Swagger
- 🔒 **Seguridad** con bcrypt y JWT
- 📧 **Sistema de correos** con Nodemailer (opcional)
- 🗄️ **Base de datos** MongoDB con Mongoose
- 🐳 **Docker ready** para MongoDB
- 👆 **SDK Biométrico** DigitalPersona WebSDK

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt (encriptación)
- Nodemailer (correos SMTP)
- dotenv (variables de entorno)

### Frontend
- React 18
- React Router DOM
- TailwindCSS
- Recharts (gráficas)
- Lucide React (iconos)
- Axios
- React Hot Toast (notificaciones)
- date-fns (manejo de fechas)

## 📦 Instalación

### Requisitos Previos
- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- Cuenta de Gmail (para SMTP)

### 1. Clonar o descargar el proyecto

```bash
cd sistema-asistencia
```

### 2. Instalar todas las dependencias

```bash
npm run install-all
```

Este comando instalará las dependencias del proyecto raíz, del servidor y del cliente.

### 3. Configurar variables de entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/sistema-asistencia

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiar_en_produccion

# Server
PORT=5000
NODE_ENV=development

# SMTP Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave_de_aplicacion_de_google

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Configurar SMTP de Gmail

Para que funcionen las notificaciones por correo, sigue estos pasos:

#### Paso 1: Crear o usar una cuenta de Gmail
- Usa una cuenta de Gmail existente o crea una nueva

#### Paso 2: Activar verificación en dos pasos
1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Selecciona **Seguridad**
3. Activa **Verificación en dos pasos**

#### Paso 3: Generar contraseña de aplicación
1. En **Seguridad**, busca **Contraseñas de aplicaciones**
2. Selecciona **Correo** y **Otro (nombre personalizado)**
3. Escribe "Sistema de Asistencia"
4. Copia la contraseña generada (16 caracteres)

#### Paso 4: Configurar en .env
```env
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # La contraseña de aplicación
```

## 🚀 Ejecución

### Modo Desarrollo (Recomendado)

Ejecuta frontend y backend simultáneamente:

```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Ejecutar por separado

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

## 👤 Usuarios por Defecto

Para empezar, necesitas crear un usuario administrador manualmente en MongoDB o usar MongoDB Compass:

```javascript
// Conectar a MongoDB y ejecutar:
use sistema-asistencia

db.users.insertOne({
  nombre: "Admin",
  apellidos: "Sistema",
  correo: "admin@empresa.com",
  celular: "1234567890",
  area: "Administración",
  rol: "admin",
  password: "$2a$10$XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx", // password: admin123
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Credenciales de prueba:**
- **Correo:** admin@empresa.com
- **Contraseña:** admin123

> ⚠️ **Importante:** Cambia estas credenciales después del primer inicio de sesión.

## 📚 Estructura del Proyecto

```
sistema-asistencia/
├── server/                    # Backend
│   ├── controllers/          # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── attendance.controller.js
│   ├── models/               # Modelos de MongoDB
│   │   ├── User.model.js
│   │   └── Attendance.model.js
│   ├── routes/               # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── attendance.routes.js
│   ├── middlewares/          # Middlewares
│   │   └── auth.middleware.js
│   ├── services/             # Servicios
│   │   └── email.service.js
│   ├── index.js              # Punto de entrada
│   └── package.json
│
├── client/                    # Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/          # Context API
│   │   │   └── AuthContext.js
│   │   ├── pages/            # Páginas
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Usuarios.js
│   │   │   ├── UserHome.js
│   │   │   └── Unauthorized.js
│   │   ├── utils/            # Utilidades
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore
├── package.json              # Scripts principales
├── README.md                 # Este archivo
└── DOCS.md                   # Documentación técnica detallada
```

## 🔑 Roles y Permisos

### Admin
- ✅ Acceso completo al sistema
- ✅ CRUD de usuarios
- ✅ Visualización del dashboard
- ✅ Acceso a todas las asistencias
- ✅ Filtros y exportación de datos

### CEO
- ✅ Visualización del dashboard
- ✅ Acceso a todas las asistencias
- ✅ Recibe notificaciones de ingresos
- ❌ No puede crear/editar usuarios

### User
- ✅ Inicio de sesión
- ✅ Registro automático de asistencia
- ✅ Visualización de sus propias asistencias
- ❌ No accede al dashboard ni gestión

## 📊 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión y registrar asistencia
- `GET /api/auth/perfil` - Obtener perfil del usuario
- `GET /api/auth/verificar` - Verificar token JWT

### Usuarios (Solo Admin)
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `GET /api/users/rol/:rol` - Obtener usuarios por rol

### Asistencias (Admin y CEO)
- `GET /api/attendance` - Obtener todas las asistencias
- `GET /api/attendance/rango` - Obtener por rango de fechas
- `GET /api/attendance/estadisticas` - Obtener estadísticas
- `GET /api/attendance/resumen-dias` - Resumen por días
- `GET /api/attendance/usuario/:id` - Asistencias de un usuario
- `DELETE /api/attendance/:id` - Eliminar asistencia (solo admin)

## 🎨 Paleta de Colores

- **Primario:** #0033CC (Azul)
- **Secundario:** #38BDF8 (Celeste)
- **Accent:** #E0F2FE (Celeste claro)
- **Blanco:** #FFFFFF

## 📧 Flujo de Notificación

1. Usuario inicia sesión
2. Se registra automáticamente la asistencia
3. Se obtienen todos los usuarios con rol `ceo`
4. Se envía correo a todos los CEOs con:
   - Nombre completo del usuario
   - Área
   - Fecha y hora exacta
   - Plantilla HTML corporativa

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación JWT con expiración
- ✅ Validación de datos en frontend y backend
- ✅ Middleware de protección de rutas
- ✅ Verificación de roles
- ✅ Variables sensibles en .env
- ✅ CORS configurado

## 📱 Características del Dashboard

- 📊 Tarjetas de estadísticas (total asistencias, usuarios activos, promedio)
- 📅 Filtros por fecha (rangos rápidos: 7, 20, 30, 50, 100 días)
- 👤 Filtro por usuario específico
- 📈 Gráfica de líneas (asistencias por día)
- 📊 Gráfica de barras (top usuarios)
- 📋 Tabla detallada de asistencias
- 💾 Exportación a CSV
- 🔄 Actualización en tiempo real

## 🚀 Despliegue

### Backend (Heroku, Railway, Render)
1. Configura las variables de entorno
2. Conecta a MongoDB Atlas
3. Despliega el directorio `server/`

### Frontend (Vercel, Netlify)
1. Configura `REACT_APP_API_URL` con la URL del backend
2. Despliega el directorio `client/`

### MongoDB Atlas
1. Crea un cluster gratuito
2. Configura acceso de red (IP whitelist)
3. Obtén la URI de conexión
4. Actualiza `MONGO_URI` en `.env`

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verifica que MongoDB esté corriendo
mongod --version

# O usa MongoDB Atlas
```

### Error de SMTP
```bash
# Verifica las credenciales en .env
# Asegúrate de usar contraseña de aplicación, no la contraseña normal
```

### Puerto en uso
```bash
# Cambia el puerto en .env
PORT=5001
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 📚 Documentación Adicional

Este proyecto incluye documentación completa para diferentes aspectos:

### 📖 Documentos Disponibles

- **[DOCS.md](./DOCS.md)** - Documentación técnica completa del sistema
- **[PROXIMOS_PASOS.md](./PROXIMOS_PASOS.md)** - Guía para llevar el sistema a producción
  - Configuración de SMTP (Gmail, SendGrid, AWS SES)
  - MongoDB en AWS (Atlas y EC2)
  - Despliegue en producción (EC2, Heroku, Vercel)
  - Seguridad y monitoreo
  - CI/CD con GitHub Actions
  
- **[GUIA_BIOMETRIA.md](./GUIA_BIOMETRIA.md)** - 🔐 Guía Completa del Sistema Biométrico
  - Instalación del SDK DigitalPersona
  - Configuración del lector de huellas
  - Uso del sistema de registro
  - Terminal de marcación
  - API Reference completa
  - Solución de problemas
  - Seguridad y cumplimiento legal

- **[INSTALACION_BIOMETRIA.md](./INSTALACION_BIOMETRIA.md)** - 🚀 Instalación Rápida
  - Checklist paso a paso
  - Configuración del hardware
  - Setup del software
  - Pruebas iniciales
  - Modo kiosko para terminal

- **[ESCALABILIDAD.md](./ESCALABILIDAD.md)** - Plan de escalabilidad y futuras funcionalidades
  - Arquitectura de microservicios
  - Implementación de huellas dactilares
  - Reconocimiento facial
  - Aplicación móvil con biometría
  - Infraestructura escalable
  - Estimación de costos
  - Roadmap de implementación

- **[ARQUITECTURA_AREAS_INHOUSE.md](./ARQUITECTURA_AREAS_INHOUSE.md)** - Sistema de Áreas e In Houses
  - Estructura jerárquica: Áreas → In Houses → Usuarios
  - Roles: Admin de Área y Encargado de In House
  - Modelos de datos completos
  - Flujos de trabajo detallados
  - API endpoints
  - Plan de implementación por fases

### 🔗 API Documentation con Swagger

La documentación interactiva de la API está disponible con Swagger UI:

**URL**: `http://localhost:5001/api-docs`

#### Características de Swagger:
- 📋 **Listado completo** de todos los endpoints
- 🧪 **Pruebas interactivas** - Ejecuta requests directamente desde el navegador
- 📝 **Esquemas de datos** - Ve la estructura de Usuario y Asistencia
- 🔐 **Autenticación JWT** integrada - Autoriza una vez y prueba todos los endpoints
- 📖 **Documentación detallada** - Parámetros, respuestas y ejemplos

#### Endpoints Documentados:
- **Autenticación**: Login, perfil, verificar token
- **Usuarios**: CRUD completo (solo admin)
- **Asistencias**: Ingreso, salida, consultas, estadísticas, tiempo real

#### Guía Rápida:
1. Inicia el servidor: `npm run dev`
2. Abre: http://localhost:5001/api-docs
3. Haz login en `/auth/login` para obtener el token
4. Haz clic en **"Authorize"** y pega el token
5. ¡Prueba todos los endpoints!

📚 **Guía completa**: Ver [server/SWAGGER_GUIDE.md](./server/SWAGGER_GUIDE.md)

## 🎯 Casos de Uso

### Para Usuarios
1. Iniciar sesión en el sistema
2. Marcar ingreso al llegar a trabajar
3. Marcar salida al terminar la jornada o salir temporalmente
4. Ver historial de asistencias propias
5. Verificar ingresos y salidas del día

### Para Administradores/CEOs
1. Ver dashboard con estadísticas generales
2. Consultar panel en tiempo real de usuarios activos
3. Filtrar asistencias por fecha y usuario
4. Exportar reportes en CSV
5. Gestionar usuarios (solo admin)
6. Ver gráficas de tendencias
7. **NUEVO:** Gestionar huellas dactilares de usuarios
8. **NUEVO:** Ver estadísticas de uso biométrico

### Para Terminal de Marcación Biométrica
1. Colocar dedo en el lector DigitalPersona 4500
2. Sistema verifica automáticamente la huella
3. Marca ingreso si no hay registro activo
4. Marca salida si ya hay un ingreso registrado
5. Muestra confirmación visual en pantalla
6. Registra en actividad reciente

## 🔮 Próximas Funcionalidades

- 📱 **Aplicación móvil** con React Native
- 📍 **Geolocalización** para validar ubicación
- 📊 **Reportes avanzados** en PDF
- 🔔 **Notificaciones push** en tiempo real
- 🎨 **Temas personalizables** (modo oscuro)
- 👤 **Reconocimiento facial** como alternativa biométrica

## 👨‍💻 Soporte y Contribución

## 📞 Contacto

Para más información técnica:
- 📧 Email: soporte@empresa.com
- 📖 Documentación: Consulta los archivos MD en el repositorio
- 🐛 Issues: GitHub Issues

---

*Sistema de Asistencia v1.0.0 - Control de Ingreso y Salida del Personal*
