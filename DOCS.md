# 📘 Documentación Técnica - Sistema de Control de Asistencia

## Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Flujo de Autenticación JWT](#flujo-de-autenticación-jwt)
3. [Flujo de Registro de Asistencia](#flujo-de-registro-de-asistencia)
4. [Modelos de Base de Datos](#modelos-de-base-de-datos)
5. [API Endpoints Detallados](#api-endpoints-detallados)
6. [Sistema de Notificaciones](#sistema-de-notificaciones)
7. [Configuración de TailwindCSS](#configuración-de-tailwindcss)
8. [Gestión de Estado](#gestión-de-estado)
9. [Seguridad](#seguridad)
10. [Despliegue en Producción](#despliegue-en-producción)
11. [Extensiones Futuras](#extensiones-futuras)

---

## Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  React 18 + React Router + TailwindCSS + Recharts      │
│                                                          │
│  Componentes:                                           │
│  - Login (Autenticación)                                │
│  - Dashboard (Analytics)                                │
│  - Usuarios (CRUD)                                      │
│  - UserHome (Vista usuario)                             │
│  - Navbar (Navegación)                                  │
│  - ProtectedRoute (Seguridad)                           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS (Axios)
                           │ JWT Token
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                             │
│           Node.js + Express + Mongoose                   │
│                                                          │
│  Capas:                                                 │
│  ├── Routes (Rutas)                                     │
│  ├── Middlewares (Autenticación/Autorización)          │
│  ├── Controllers (Lógica de negocio)                   │
│  ├── Services (Correo electrónico)                     │
│  └── Models (Esquemas de datos)                        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                         │
│                      MongoDB                             │
│                                                          │
│  Colecciones:                                           │
│  - users (Usuarios del sistema)                         │
│  - attendances (Registros de asistencia)               │
└─────────────────────────────────────────────────────────┘
                           │
                           │ SMTP
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICIO EXTERNO                        │
│                    Gmail SMTP                            │
│              (Notificaciones por correo)                │
└─────────────────────────────────────────────────────────┘
```

### Patrón de Diseño

El proyecto sigue el patrón **MVC (Model-View-Controller)** adaptado para aplicaciones web modernas:

- **Model**: Esquemas de Mongoose (User, Attendance)
- **View**: Componentes de React
- **Controller**: Controladores de Express

---

## Flujo de Autenticación JWT

### 1. Proceso de Login

```javascript
// Cliente (React)
POST /api/auth/login
Body: { correo, password }

// Servidor (Express)
1. Buscar usuario por correo
2. Verificar contraseña con bcrypt
3. Generar token JWT
4. Registrar asistencia automáticamente
5. Obtener CEOs para notificar
6. Enviar correo asíncrono
7. Retornar token y datos del usuario

// Cliente recibe:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  usuario: { id, nombre, apellidos, correo, rol, ... },
  asistencia: { id, fecha, hora }
}
```

### 2. Almacenamiento del Token

```javascript
// LocalStorage
localStorage.setItem('token', token);
localStorage.setItem('usuario', JSON.stringify(usuario));
```

### 3. Protección de Rutas

```javascript
// Middleware: protegerRuta
1. Extraer token del header Authorization
2. Verificar token con JWT_SECRET
3. Decodificar payload
4. Buscar usuario en BD
5. Adjuntar usuario a req.usuario
6. Continuar a la siguiente función
```

### 4. Verificación de Roles

```javascript
// Middleware: verificarRol
1. Verificar que req.usuario existe
2. Comparar rol del usuario con roles permitidos
3. Permitir o denegar acceso
```

### 5. Diagrama de Flujo

```
Usuario ingresa credenciales
         │
         ▼
   Validar datos
         │
         ▼
  Buscar en MongoDB
         │
    ┌────┴────┐
    │         │
Usuario    Usuario
no existe  existe
    │         │
    │         ▼
    │   Comparar password
    │         │
    │    ┌────┴────┐
    │    │         │
    │  Password  Password
    │  inválido  válido
    │    │         │
    └────┴─────────┤
         │         ▼
         │   Generar JWT
         │         │
         │         ▼
         │   Registrar asistencia
         │         │
         │         ▼
         │   Notificar CEOs
         │         │
         │         ▼
         │   Retornar token
         │         │
         ▼         ▼
    Error 401   Success 200
```

---

## Flujo de Registro de Asistencia

### Proceso Completo

```javascript
// 1. Usuario inicia sesión
POST /api/auth/login

// 2. En el controlador de login:
const ahora = new Date();
const horaFormateada = ahora.toLocaleTimeString('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
});

// 3. Crear registro de asistencia
const asistencia = await Attendance.create({
  usuario: usuario._id,
  fecha: ahora,
  hora: horaFormateada,
  userAgent: req.headers['user-agent'],
  ip: req.ip || req.connection.remoteAddress
});

// 4. Obtener CEOs
const ceos = await User.find({ rol: 'ceo', activo: true });
const ceoEmails = ceos.map(ceo => ceo.correo);

// 5. Enviar notificación (asíncrono)
enviarNotificacionIngreso(usuario, fechaHoraCompleta, ceoEmails)
  .then(resultado => {
    console.log('Notificación enviada');
  })
  .catch(error => {
    console.error('Error al enviar notificación');
  });

// 6. Responder inmediatamente (no bloquear)
res.status(200).json({
  success: true,
  token,
  usuario,
  asistencia
});
```

### Características Importantes

- ✅ **Automático**: Se registra al iniciar sesión
- ✅ **No bloqueante**: El correo se envía de forma asíncrona
- ✅ **Información capturada**: Fecha, hora, user-agent, IP
- ✅ **Referencia**: Vinculado al usuario mediante ObjectId

---

## Modelos de Base de Datos

### User Model

```javascript
{
  nombre: String (required, trim),
  apellidos: String (required, trim),
  correo: String (required, unique, lowercase, email),
  celular: String (required, trim),
  area: String (required, trim),
  rol: String (enum: ['admin', 'user', 'ceo'], default: 'user'),
  password: String (required, minlength: 6, select: false),
  activo: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Métodos:
- compararPassword(passwordIngresado): Boolean
- getNombreCompleto(): String

// Hooks:
- pre('save'): Encripta password con bcrypt
```

### Attendance Model

```javascript
{
  usuario: ObjectId (ref: 'User', required),
  fecha: Date (required, default: Date.now),
  hora: String (required),
  userAgent: String (default: ''),
  ip: String (default: ''),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Índices:
- { usuario: 1, fecha: -1 }

// Métodos estáticos:
- obtenerPorRango(fechaInicio, fechaFin, usuarioId)
- contarPorUsuario(fechaInicio, fechaFin)
```

### Relaciones

```
User (1) ──────── (N) Attendance
  │
  └─ _id ────────> usuario
```

---

## API Endpoints Detallados

### Autenticación

#### POST /api/auth/login

**Descripción**: Autentica usuario y registra asistencia automáticamente.

**Request:**
```json
{
  "correo": "usuario@empresa.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "65abc123...",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@empresa.com",
    "celular": "1234567890",
    "area": "Ventas",
    "rol": "user"
  },
  "asistencia": {
    "id": "65abc456...",
    "fecha": "2024-01-15T08:30:00.000Z",
    "hora": "08:30:15 AM"
  }
}
```

**Errores:**
- 400: Datos faltantes
- 401: Credenciales inválidas o usuario inactivo

---

#### GET /api/auth/perfil

**Descripción**: Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "usuario": {
    "id": "65abc123...",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@empresa.com",
    "celular": "1234567890",
    "area": "Ventas",
    "rol": "user",
    "activo": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Usuarios (Solo Admin)

#### GET /api/users

**Descripción**: Obtiene todos los usuarios.

**Query Params:**
- `rol`: Filtrar por rol (admin, user, ceo)
- `activo`: Filtrar por estado (true, false)

**Response (200):**
```json
{
  "success": true,
  "total": 15,
  "usuarios": [
    {
      "_id": "65abc123...",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "correo": "juan@empresa.com",
      "celular": "1234567890",
      "area": "Ventas",
      "rol": "user",
      "activo": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/users

**Descripción**: Crea un nuevo usuario.

**Request:**
```json
{
  "nombre": "María",
  "apellidos": "García",
  "correo": "maria@empresa.com",
  "celular": "9876543210",
  "area": "Marketing",
  "rol": "user",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "usuario": {
    "_id": "65abc789...",
    "nombre": "María",
    "apellidos": "García",
    "correo": "maria@empresa.com",
    "celular": "9876543210",
    "area": "Marketing",
    "rol": "user",
    "activo": true
  }
}
```

---

### Asistencias (Admin y CEO)

#### GET /api/attendance/estadisticas

**Descripción**: Obtiene estadísticas de asistencias.

**Query Params:**
- `fechaInicio`: Fecha inicio (YYYY-MM-DD)
- `fechaFin`: Fecha fin (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "periodo": {
    "fechaInicio": "2024-01-01T00:00:00.000Z",
    "fechaFin": "2024-01-31T23:59:59.999Z"
  },
  "estadisticas": {
    "totalAsistencias": 450,
    "usuariosActivos": 15,
    "promedioAsistenciasPorUsuario": "30.00"
  },
  "conteoPorUsuario": [
    {
      "_id": "65abc123...",
      "totalAsistencias": 28,
      "ultimaAsistencia": "2024-01-31T08:30:00.000Z",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "area": "Ventas"
    }
  ],
  "ultimasAsistencias": [...]
}
```

---

## Sistema de Notificaciones

### Configuración de Nodemailer

```javascript
const transportador = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### Plantilla HTML

La plantilla de correo incluye:
- **Header**: Gradiente azul con título
- **Body**: Información del usuario en tabla
- **Footer**: Copyright y año actual
- **Responsive**: Adaptable a móviles
- **Colores corporativos**: Azul, celeste y blanco

### Proceso de Envío

```javascript
1. Usuario inicia sesión
2. Se registra asistencia
3. Se obtienen correos de CEOs
4. Se genera HTML con plantilla
5. Se envía correo (Promise asíncrono)
6. Se registra resultado en consola
7. No bloquea la respuesta al cliente
```

---

## Configuración de TailwindCSS

### Colores Personalizados

```javascript
colors: {
  primary: {
    DEFAULT: '#0033CC',
    light: '#2563EB',
    dark: '#001A66'
  },
  secondary: {
    DEFAULT: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0284C7'
  },
  accent: {
    DEFAULT: '#E0F2FE',
    light: '#F0F9FF',
    dark: '#BAE6FD'
  }
}
```

### Clases Personalizadas

```css
.btn-primary: Botón primario con hover y sombra
.btn-secondary: Botón secundario
.btn-outline: Botón con borde
.card: Tarjeta con sombra y bordes redondeados
.input-field: Campo de entrada estilizado
.table-header: Encabezado de tabla con gradiente
.badge: Insignia para roles y estados
```

### Animaciones

```javascript
animations: {
  'fade-in': Aparición suave
  'slide-up': Deslizamiento hacia arriba
  'slide-down': Deslizamiento hacia abajo
  'scale-in': Escala desde el centro
}
```

---

## Gestión de Estado

### Context API (AuthContext)

```javascript
// Estado global:
- usuario: Datos del usuario autenticado
- autenticado: Boolean de autenticación
- cargando: Estado de carga

// Funciones:
- iniciarSesion(correo, password)
- cerrarSesion()
- verificarAutenticacion()
- esAdmin()
- esCEO()
- esUsuario()
```

### LocalStorage

```javascript
// Datos persistentes:
- token: JWT token
- usuario: Objeto con datos del usuario
```

---

## Seguridad

### Encriptación de Contraseñas

```javascript
// Bcrypt con salt rounds = 10
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### JWT Token

```javascript
// Payload:
{
  id: usuario._id,
  iat: timestamp,
  exp: timestamp + 30 días
}

// Firma:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

### Validaciones

**Frontend:**
- Validación de formularios con HTML5
- Validación de tipos de datos
- Sanitización de inputs

**Backend:**
- Validación con express-validator
- Validación de esquemas con Mongoose
- Verificación de permisos por rol

### CORS

```javascript
cors({
  origin: process.env.CLIENT_URL,
  credentials: true
})
```

---

## Despliegue en Producción

### Backend (Railway/Render)

1. **Preparar el proyecto:**
```bash
cd server
npm install
```

2. **Variables de entorno:**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=clave_super_segura_produccion
PORT=5000
NODE_ENV=production
SMTP_USER=correo@gmail.com
SMTP_PASS=clave_aplicacion
CLIENT_URL=https://tu-frontend.vercel.app
```

3. **Desplegar:**
- Conectar repositorio
- Configurar build command: `npm install`
- Configurar start command: `node index.js`
- Agregar variables de entorno

### Frontend (Vercel/Netlify)

1. **Preparar el proyecto:**
```bash
cd client
npm install
npm run build
```

2. **Variables de entorno:**
```env
REACT_APP_API_URL=https://tu-backend.railway.app/api
```

3. **Desplegar:**
- Conectar repositorio
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `build`

### MongoDB Atlas

1. Crear cluster gratuito
2. Configurar usuario de base de datos
3. Whitelist IP: `0.0.0.0/0` (todas)
4. Obtener connection string
5. Reemplazar `<password>` con tu contraseña

---

## Extensiones Futuras

### Funcionalidades Adicionales

1. **Registro de Salida**
   - Botón para marcar salida
   - Cálculo de horas trabajadas
   - Reporte de horas extras

2. **Geolocalización**
   - Capturar ubicación GPS
   - Validar que esté en la oficina
   - Mapa de asistencias

3. **Reconocimiento Facial**
   - Captura de foto al ingresar
   - Validación con IA
   - Prevención de fraude

4. **Reportes Avanzados**
   - PDF con gráficas
   - Excel con datos detallados
   - Envío automático mensual

5. **Dashboard Mejorado**
   - Predicciones con ML
   - Alertas de ausencias
   - Comparativas mensuales

6. **Notificaciones Push**
   - Web Push API
   - Notificaciones en tiempo real
   - Alertas personalizadas

7. **Integración con Calendario**
   - Google Calendar
   - Outlook Calendar
   - Sincronización automática

8. **Sistema de Permisos**
   - Solicitud de vacaciones
   - Aprobación de permisos
   - Historial de ausencias

---

## Comandos Útiles

### Desarrollo

```bash
# Instalar todo
npm run install-all

# Ejecutar ambos (frontend + backend)
npm run dev

# Solo backend
npm run server

# Solo frontend
npm run client
```

### Base de Datos

```bash
# Conectar a MongoDB local
mongosh

# Usar base de datos
use sistema-asistencia

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Ver asistencias
db.attendances.find().pretty()

# Crear usuario admin
db.users.insertOne({...})
```

### Git

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit"

# Conectar a GitHub
git remote add origin https://github.com/tu-usuario/sistema-asistencia.git

# Push
git push -u origin main
```

---

## Contacto y Soporte

Para más información o soporte técnico, consulta:
- README.md (Guía de inicio rápido)
- Código fuente (Comentarios detallados)
- Issues en GitHub

---

**Última actualización:** Octubre 2024
**Versión:** 1.0.0
