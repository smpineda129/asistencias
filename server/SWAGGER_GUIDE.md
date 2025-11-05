# 📚 Guía de Uso de Swagger API Documentation

## 🌐 Acceso a Swagger UI

Una vez que el servidor esté corriendo, accede a la documentación interactiva en:

```
http://localhost:5001/api-docs
```

## 🔐 Autenticación en Swagger

### Paso 1: Obtener Token JWT

1. Expande el endpoint **POST /auth/login**
2. Haz clic en **"Try it out"**
3. Ingresa las credenciales:
   ```json
   {
     "correo": "admin@empresa.com",
     "password": "password123"
   }
   ```
4. Haz clic en **"Execute"**
5. Copia el `token` de la respuesta

### Paso 2: Autorizar Swagger

1. Haz clic en el botón **"Authorize"** (candado) en la parte superior derecha
2. Ingresa el token en el formato: `Bearer tu_token_aqui`
3. Haz clic en **"Authorize"**
4. Cierra el modal

¡Ahora puedes probar todos los endpoints protegidos!

## 📋 Endpoints Disponibles

### 🔐 Autenticación

#### POST /auth/login
- **Descripción**: Iniciar sesión y obtener token JWT
- **Acceso**: Público
- **Body**:
  ```json
  {
    "correo": "usuario@empresa.com",
    "password": "password123"
  }
  ```
- **Respuesta**: Token JWT y datos del usuario

#### GET /auth/perfil
- **Descripción**: Obtener perfil del usuario autenticado
- **Acceso**: Privado (requiere token)
- **Respuesta**: Datos completos del usuario

#### GET /auth/verificar
- **Descripción**: Verificar si el token es válido
- **Acceso**: Privado (requiere token)
- **Respuesta**: Confirmación de validez del token

---

### 👥 Usuarios (Solo Admin)

#### GET /users
- **Descripción**: Obtener lista de todos los usuarios
- **Acceso**: Admin
- **Query Params**: 
  - `activo` (boolean): Filtrar por estado
- **Respuesta**: Array de usuarios

#### POST /users
- **Descripción**: Crear nuevo usuario
- **Acceso**: Admin
- **Body**:
  ```json
  {
    "nombre": "Juan",
    "apellidos": "Pérez García",
    "correo": "juan.perez@empresa.com",
    "password": "password123",
    "celular": "555-1234",
    "area": "Desarrollo",
    "rol": "user"
  }
  ```
- **Respuesta**: Usuario creado

#### PUT /users/{id}
- **Descripción**: Actualizar usuario existente
- **Acceso**: Admin
- **Params**: `id` - ID del usuario
- **Body**: Campos a actualizar
- **Respuesta**: Usuario actualizado

#### DELETE /users/{id}
- **Descripción**: Eliminar usuario
- **Acceso**: Admin
- **Params**: `id` - ID del usuario
- **Respuesta**: Confirmación de eliminación

---

### ⏰ Asistencias

#### POST /attendance/ingreso
- **Descripción**: Marcar ingreso (hora de entrada)
- **Acceso**: Privado
- **Body**: No requiere (usa usuario autenticado)
- **Respuesta**: Asistencia creada con hora de ingreso

#### PUT /attendance/salida/{id}
- **Descripción**: Marcar salida (hora de salida)
- **Acceso**: Privado
- **Params**: `id` - ID de la asistencia activa
- **Respuesta**: Asistencia actualizada con hora de salida

#### GET /attendance/activa
- **Descripción**: Obtener asistencia activa del usuario (sin salida)
- **Acceso**: Privado
- **Respuesta**: Asistencia activa o null

#### GET /attendance/estado-tiempo-real
- **Descripción**: Ver estado en tiempo real de todos los usuarios
- **Acceso**: Admin/CEO
- **Respuesta**: 
  - Usuarios activos (con ingreso sin salida)
  - Usuarios inactivos (sin ingreso)
  - Estadísticas del día

#### GET /attendance/rango
- **Descripción**: Obtener asistencias por rango de fechas
- **Acceso**: Admin/CEO
- **Query Params**:
  - `fechaInicio` (date): Fecha inicial
  - `fechaFin` (date): Fecha final
  - `usuarioId` (string): Filtrar por usuario
- **Respuesta**: Array de asistencias

#### GET /attendance/estadisticas
- **Descripción**: Obtener estadísticas de asistencias
- **Acceso**: Admin/CEO
- **Query Params**:
  - `fechaInicio` (date)
  - `fechaFin` (date)
- **Respuesta**: Estadísticas calculadas

#### GET /attendance
- **Descripción**: Obtener todas las asistencias con filtros
- **Acceso**: Admin/CEO
- **Query Params**:
  - `usuarioId` (string)
  - `fecha` (date)
- **Respuesta**: Array de asistencias

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Usuario

```bash
# 1. Login
POST /auth/login
{
  "correo": "juan.perez@empresa.com",
  "password": "password123"
}
# Respuesta: { token: "eyJhbGc..." }

# 2. Marcar Ingreso
POST /attendance/ingreso
# Headers: Authorization: Bearer eyJhbGc...
# Respuesta: { asistencia: { _id: "abc123", horaIngreso: "08:30:00" } }

# 3. Verificar Asistencia Activa
GET /attendance/activa
# Respuesta: { asistenciaActiva: { _id: "abc123", estado: "activo" } }

# 4. Marcar Salida
PUT /attendance/salida/abc123
# Respuesta: { asistencia: { horaSalida: "17:00:00", estado: "completado" } }
```

### Ejemplo 2: Admin Consultando Estadísticas

```bash
# 1. Login como Admin
POST /auth/login
{
  "correo": "admin@empresa.com",
  "password": "password123"
}

# 2. Ver Estado en Tiempo Real
GET /attendance/estado-tiempo-real
# Respuesta: {
#   resumen: {
#     totalUsuarios: 8,
#     usuariosActivos: 5,
#     usuariosInactivos: 3
#   },
#   usuariosActivos: [...],
#   usuariosInactivos: [...]
# }

# 3. Obtener Estadísticas del Mes
GET /attendance/estadisticas?fechaInicio=2024-01-01&fechaFin=2024-01-31
# Respuesta: {
#   estadisticas: {
#     totalAsistencias: 120,
#     usuariosActivos: 8,
#     promedioAsistenciasPorUsuario: 15
#   }
# }
```

---

## 🎨 Características de Swagger UI

### Probar Endpoints
1. Haz clic en cualquier endpoint
2. Clic en **"Try it out"**
3. Completa los parámetros necesarios
4. Clic en **"Execute"**
5. Ve la respuesta en tiempo real

### Ver Esquemas
- Expande **"Schemas"** al final de la página
- Ve la estructura de `Usuario` y `Asistencia`
- Conoce los campos requeridos y opcionales

### Copiar Código
- Swagger genera código de ejemplo en varios lenguajes
- Útil para integrar con otras aplicaciones

---

## 🔧 Configuración Personalizada

El archivo de configuración está en:
```
server/config/swagger.js
```

### Cambiar URL del Servidor

```javascript
servers: [
  {
    url: 'http://localhost:5001/api',
    description: 'Desarrollo'
  },
  {
    url: 'https://tu-api.com/api',
    description: 'Producción'
  }
]
```

### Agregar Nuevos Endpoints

Usa anotaciones JSDoc en los archivos de rutas:

```javascript
/**
 * @swagger
 * /ruta/nueva:
 *   get:
 *     summary: Descripción del endpoint
 *     tags: [Categoría]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 */
router.get('/ruta/nueva', controller);
```

---

## 📝 Notas Importantes

1. **Token Expira**: Los tokens JWT expiran en 30 días. Si recibes error 401, genera un nuevo token.

2. **Roles y Permisos**:
   - `admin`: Acceso total
   - `ceo`: Puede ver asistencias y estadísticas
   - `user`: Solo puede marcar su propia asistencia

3. **Formato de Fechas**: Usa formato ISO 8601 (YYYY-MM-DD)

4. **IDs de MongoDB**: Son strings hexadecimales de 24 caracteres

---

## 🐛 Solución de Problemas

### Error 401 Unauthorized
- Verifica que el token esté en el formato: `Bearer tu_token`
- Asegúrate de haber autorizado en Swagger UI
- El token puede haber expirado, genera uno nuevo

### Error 403 Forbidden
- Tu usuario no tiene permisos para ese endpoint
- Verifica tu rol (admin, ceo, user)

### Error 400 Bad Request
- Revisa que todos los campos requeridos estén presentes
- Verifica el formato de los datos (email, fechas, etc.)

### Error 500 Internal Server Error
- Revisa los logs del servidor
- Puede ser un error de conexión a MongoDB
- Verifica las variables de entorno

---

## 📚 Recursos Adicionales

- [Documentación de Swagger](https://swagger.io/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Editor](https://editor.swagger.io/)

---

**¡Disfruta explorando la API! 🚀**
