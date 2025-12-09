# 🔧 Solución: Error de JWT al cambiar configuración

## ❌ Problema

Después de cambiar el `JWT_SECRET` en el archivo `.env` del servidor, los usuarios que tenían sesión iniciada experimentan:

- **Síntoma**: La página se recarga automáticamente en loop
- **Error en consola**: `JsonWebTokenError: invalid signature`
- **Causa**: El token guardado en el navegador fue generado con el JWT_SECRET anterior

---

## ✅ Solución Rápida (Para usuarios)

### Opción 1: Limpiar localStorage desde la consola del navegador

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Ejecuta estos comandos:

```javascript
localStorage.removeItem('token');
localStorage.removeItem('usuario');
location.reload();
```

### Opción 2: Limpiar desde DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
3. En el menú lateral, selecciona "Local Storage"
4. Click en tu dominio (http://localhost:3000)
5. Elimina las claves `token` y `usuario`
6. Recarga la página (F5)

### Opción 3: Borrar datos del sitio

1. Click derecho en la página
2. "Inspeccionar" → "Application" → "Clear storage"
3. Click en "Clear site data"
4. Recarga la página

---

## 🛠️ Solución Técnica (Implementada)

Se han implementado mejoras en el código para manejar este error automáticamente:

### 1. Interceptor de API mejorado (`client/src/utils/api.js`)

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Mejora**: Evita loops de redirección verificando que no estemos en `/login`

### 2. AuthContext mejorado (`client/src/context/AuthContext.js`)

```javascript
catch (error) {
  // Si el error es de JWT inválido, limpiar localStorage silenciosamente
  if (error.response?.status === 401 || error.message?.includes('jwt')) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setAutenticado(false);
  }
}
```

**Mejora**: Limpia tokens inválidos automáticamente sin mostrar errores molestos

---

## 🔄 Flujo de recuperación automática

1. **Usuario intenta acceder** → Token antiguo en localStorage
2. **API rechaza el token** → Error 401
3. **Interceptor detecta error** → Limpia localStorage automáticamente
4. **Redirige a login** → Usuario puede iniciar sesión nuevamente
5. **Nuevo token generado** → Con el JWT_SECRET actualizado

---

## 🚨 Cuándo ocurre este problema

Este error solo ocurre cuando:

- ✅ Se cambia el `JWT_SECRET` en el servidor
- ✅ Hay usuarios con sesión activa (token guardado)
- ✅ El servidor se reinicia con el nuevo secret

**Situaciones comunes:**
- Migración de base de datos
- Cambio de entorno (desarrollo → producción)
- Actualización de configuración de seguridad
- Rotación de secrets por seguridad

---

## 🔐 Prevención futura

### Para desarrolladores:

1. **Documentar cambios de JWT_SECRET**
   ```bash
   # Avisar al equipo antes de cambiar
   echo "⚠️ IMPORTANTE: Se cambiará JWT_SECRET - Todos deben cerrar sesión"
   ```

2. **Usar diferentes secrets por entorno**
   ```env
   # .env.development
   JWT_SECRET=dev_secret_key_123
   
   # .env.production
   JWT_SECRET=prod_secret_key_xyz
   ```

3. **Implementar versionado de tokens**
   ```javascript
   // Incluir versión en el payload del JWT
   const payload = {
     userId: user._id,
     version: 2  // Incrementar cuando cambie el secret
   };
   ```

### Para usuarios:

- **Cerrar sesión antes de actualizaciones** del servidor
- **Refrescar la página** si ves comportamiento extraño
- **Limpiar caché** si persisten los problemas

---

## 📊 Verificación

Después de aplicar la solución, verifica:

1. ✅ No hay loops de recarga
2. ✅ La página de login se muestra correctamente
3. ✅ Puedes iniciar sesión sin problemas
4. ✅ No hay errores de JWT en la consola del servidor
5. ✅ El token nuevo funciona correctamente

---

## 🧪 Testing

Para probar que la solución funciona:

```javascript
// 1. Iniciar sesión normalmente
// 2. En la consola del navegador:
localStorage.setItem('token', 'token_invalido_de_prueba');

// 3. Recargar la página
location.reload();

// 4. Debería redirigir a login automáticamente sin loops
```

---

## 📝 Logs útiles

### En el servidor:
```
Error en autenticación: JsonWebTokenError: invalid signature
```
**Solución**: Usuario tiene token antiguo, se limpiará automáticamente

### En el navegador:
```
Error al verificar autenticación: Error: Request failed with status code 401
```
**Solución**: Normal, el sistema limpiará el token y redirigirá a login

---

## 🎯 Resumen

| Antes | Después |
|-------|---------|
| ❌ Loop infinito de recarga | ✅ Redirección limpia a login |
| ❌ Error visible en consola | ✅ Limpieza silenciosa |
| ❌ Usuario confundido | ✅ Experiencia fluida |
| ❌ Requiere intervención manual | ✅ Recuperación automática |

---

## 💡 Mejores prácticas

1. **No cambiar JWT_SECRET en producción** sin planificación
2. **Avisar a usuarios** antes de cambios que invaliden tokens
3. **Implementar refresh tokens** para sesiones largas
4. **Monitorear errores 401** en producción
5. **Documentar cambios** de configuración crítica

---

**Fecha de solución**: Diciembre 2024  
**Archivos modificados**:
- `client/src/utils/api.js`
- `client/src/context/AuthContext.js`
