# 🧪 Prueba del Sistema de Áreas

## ⚠️ Problemas Identificados y Solucionados

### 1. **Índices Duplicados en Modelos**
- ✅ **Area.js**: Removido `unique: true` del campo y agregado al índice
- ✅ **InHouse.js**: Removido `unique: true` del campo y agregado al índice

### 2. **Campo inHouse en Attendance**
- ✅ Hecho opcional temporalmente para compatibilidad con datos existentes
- ⚠️ **IMPORTANTE**: Los nuevos ingresos SÍ requieren inHouseId

### 3. **Pasos para Probar**

#### A. Reiniciar el Servidor
```bash
cd server
# Detener el servidor actual (Ctrl+C)
npm run dev
```

#### B. Verificar que no hay errores de modelos
El servidor debe iniciar sin warnings de índices duplicados.

#### C. Probar desde el Frontend
1. Login como admin
2. Ir a "Áreas" en el navbar
3. Click en "Nueva Área"
4. Llenar formulario:
   - Nombre: "Recursos Humanos"
   - Código: "RH-001"
   - Descripción: "Área de RRHH"
   - Administrador: Seleccionar un usuario
5. Click en "Crear Área"

#### D. Si sigue el error 400

**Verificar en la consola del servidor:**
- ¿Qué mensaje de error aparece?
- ¿El usuario administrador existe?

**Verificar en el navegador (F12 → Network):**
- ¿El token se está enviando correctamente?
- ¿Cuál es el mensaje exacto del error?

### 4. **Posibles Causas del Error 400**

1. **Usuario administrador no existe**
   - Solución: Verificar que el ID del usuario es correcto
   - Ir a `/admin/usuarios` y copiar el ID correcto

2. **Código de área duplicado**
   - Solución: Usar un código diferente

3. **Token expirado**
   - Solución: Cerrar sesión y volver a iniciar

4. **Campos faltantes**
   - Verificar que todos los campos requeridos estén llenos

### 5. **Verificación Manual con cURL**

```bash
# 1. Primero hacer login y obtener token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@example.com","password":"tu_password"}'

# 2. Copiar el token de la respuesta

# 3. Crear área (reemplazar TOKEN y USER_ID)
curl -X POST http://localhost:5001/api/areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "nombre": "Recursos Humanos",
    "descripcion": "Área de RRHH",
    "codigo": "RH-001",
    "administrador": "USER_ID_AQUI"
  }'
```

### 6. **Verificar Base de Datos**

```bash
# Conectar a MongoDB
mongosh

# Usar la base de datos
use sistema-asistencia

# Ver usuarios disponibles
db.users.find({}, {nombre: 1, apellidos: 1, correo: 1, rol: 1})

# Ver si ya existen áreas
db.areas.find()
```

### 7. **Logs del Servidor**

Buscar en la consola del servidor mensajes como:
- "Error al crear área:"
- "Usuario administrador no encontrado"
- "El código de área ya existe"

---

## 🔧 Cambios Realizados

### Modelos Actualizados:
1. **Area.js** - Índices corregidos
2. **InHouse.js** - Índices corregidos  
3. **Attendance.model.js** - Campo inHouse opcional

### ⚠️ Nota Importante:
Después de estos cambios, **DEBES REINICIAR EL SERVIDOR** para que los cambios surtan efecto.

---

## 📞 Si el Error Persiste

Por favor proporciona:
1. Mensaje exacto de la consola del servidor
2. Respuesta completa del error en el navegador (F12 → Network → Response)
3. ID del usuario que estás intentando asignar como administrador
