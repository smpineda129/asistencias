# Scripts de Utilidad

Este directorio contiene scripts útiles para el mantenimiento y configuración del sistema.

## 📝 Scripts Disponibles

### 1. seed-users.js

Crea usuarios de prueba para cada rol del sistema.

**Roles creados:**
- `admin` - Administrador del sistema
- `user` - Usuario regular
- `ceo` - CEO de la empresa
- `admin_area` - Administrador de área
- `encargado_inhouse` - Encargado de InHouse

**Uso:**
```bash
cd server
node scripts/seed-users.js
```

**Credenciales generadas:**

| Rol | Email | Password |
|-----|-------|----------|
| admin | admin@sistema.com | admin123 |
| user | user@sistema.com | user123 |
| ceo | ceo@sistema.com | ceo123 |
| admin_area | adminarea@sistema.com | adminarea123 |
| encargado_inhouse | encargado@sistema.com | encargado123 |

**Datos adicionales creados:**
- Área Demo (código: DEMO)
- InHouse Demo con ubicación de ejemplo
- Asignaciones automáticas entre usuarios e InHouses

### 2. clean-seed-users.js

Elimina todos los usuarios y datos de prueba creados por `seed-users.js`.

**Uso:**
```bash
cd server
node scripts/clean-seed-users.js
```

**Elimina:**
- Todos los usuarios de prueba
- Área Demo
- InHouse Demo

## ⚙️ Requisitos

1. Tener configurado el archivo `.env` con la conexión a MongoDB
2. Tener instaladas las dependencias del proyecto:
   ```bash
   npm install
   ```

## 🔒 Seguridad

**IMPORTANTE:** Estos scripts son solo para desarrollo y pruebas. 

- ❌ NO usar en producción
- ❌ NO usar estas contraseñas en producción
- ✅ Cambiar todas las contraseñas después de las pruebas
- ✅ Eliminar usuarios de prueba antes de desplegar

## 📋 Flujo de Trabajo Recomendado

1. **Desarrollo inicial:**
   ```bash
   node scripts/seed-users.js
   ```

2. **Probar funcionalidades con diferentes roles**

3. **Limpiar antes de commit:**
   ```bash
   node scripts/clean-seed-users.js
   ```

4. **Para volver a crear usuarios:**
   ```bash
   node scripts/seed-users.js
   ```

## 🐛 Solución de Problemas

### Error: "Usuario duplicado"
- El script detecta usuarios existentes y no los duplica
- Ejecuta `clean-seed-users.js` primero si quieres recrearlos

### Error: "No se puede conectar a MongoDB"
- Verifica que MongoDB esté corriendo
- Verifica la variable `MONGO_URI` en tu archivo `.env`

### Error: "El área es obligatoria"
- El script crea automáticamente un área de ejemplo
- Si persiste, ejecuta `clean-seed-users.js` y vuelve a intentar

## 📚 Más Información

Para más detalles sobre los modelos y roles, consulta:
- `/server/models/User.model.js` - Modelo de usuario
- `/server/models/Area.js` - Modelo de área
- `/server/models/InHouse.js` - Modelo de InHouse
- `/server/middlewares/auth.middleware.js` - Middleware de autenticación y roles
