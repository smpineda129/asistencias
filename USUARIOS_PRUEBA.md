# 👥 Usuarios de Prueba

Guía rápida para crear y gestionar usuarios de prueba en el sistema.

## 🚀 Crear Usuarios de Prueba

```bash
cd server
npm run seed-users
```

Este comando creará automáticamente:
- ✅ 5 usuarios (uno por cada rol)
- ✅ 1 área de ejemplo (Área Demo)
- ✅ 1 InHouse de ejemplo con geolocalización
- ✅ Relaciones entre usuarios, áreas e InHouses

## 🔑 Credenciales de Acceso

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| **admin** | admin@sistema.com | admin123 | Administrador del sistema completo |
| **user** | user@sistema.com | user123 | Usuario regular del sistema |
| **ceo** | ceo@sistema.com | ceo123 | CEO de la empresa |
| **admin_area** | adminarea@sistema.com | adminarea123 | Administrador de área específica |
| **encargado_inhouse** | encargado@sistema.com | encargado123 | Encargado de InHouse |

## 🧹 Limpiar Usuarios de Prueba

```bash
cd server
npm run clean-users
```

Este comando eliminará:
- ❌ Todos los usuarios de prueba
- ❌ Área Demo
- ❌ InHouse Demo

## 📋 Permisos por Rol

### Admin (admin)
- ✅ Acceso total al sistema
- ✅ Gestionar usuarios
- ✅ Gestionar áreas
- ✅ Gestionar InHouses
- ✅ Ver todos los reportes

### Usuario Regular (user)
- ✅ Registrar asistencia
- ✅ Ver su propio historial
- ✅ Actualizar su perfil

### CEO (ceo)
- ✅ Ver dashboards ejecutivos
- ✅ Ver reportes globales
- ✅ Acceso a métricas del sistema

### Admin de Área (admin_area)
- ✅ Gestionar su área asignada
- ✅ Ver usuarios de su área
- ✅ Generar reportes de su área

### Encargado InHouse (encargado_inhouse)
- ✅ Gestionar su InHouse asignado
- ✅ Ver asistencias en tiempo real
- ✅ Gestionar usuarios del InHouse

## 🔄 Flujo de Trabajo

### Para Desarrollo
```bash
# 1. Crear usuarios de prueba
npm run seed-users

# 2. Desarrollar y probar

# 3. Limpiar antes de commit (opcional)
npm run clean-users
```

### Para Testing
```bash
# Crear usuarios frescos
npm run clean-users && npm run seed-users
```

## ⚠️ Importante

- 🔒 **NO usar en producción** - Estos son usuarios de prueba
- 🔒 **Cambiar contraseñas** - Las contraseñas son simples para pruebas
- 🔒 **Eliminar antes de deploy** - Limpiar usuarios de prueba antes de producción

## 📍 Datos de Ejemplo Creados

### Área Demo
- **Nombre:** Área Demo
- **Código:** DEMO
- **Administrador:** admin_area

### InHouse Demo
- **Nombre:** InHouse Demo
- **Ubicación:** Ciudad de México (coordenadas de ejemplo)
- **Radio permitido:** 100 metros
- **Encargado:** encargado_inhouse
- **Usuarios asignados:** user, encargado_inhouse

## 🐛 Solución de Problemas

### "Usuario duplicado"
El script detecta usuarios existentes. Ejecuta `npm run clean-users` primero.

### "No se puede conectar a MongoDB"
Verifica que MongoDB esté corriendo y el `.env` esté configurado correctamente.

### "El área es obligatoria"
Ejecuta `npm run clean-users` y luego `npm run seed-users` nuevamente.

## 📚 Más Información

- Ver `/server/scripts/README.md` para detalles técnicos
- Ver `/server/models/User.model.js` para estructura del modelo
- Ver `/server/middlewares/auth.middleware.js` para lógica de roles
