# Configuración de MongoDB Atlas

## ✅ Cluster Configurado

Se ha configurado el sistema para usar MongoDB Atlas en la nube.

### 📋 Detalles de la conexión:

- **Cluster**: ClusterAsistencias
- **Host**: clusterasistencias.8tdcmro.mongodb.net
- **Base de datos**: sistema-asistencia
- **Usuario**: desarrollador_db_user

### 🔧 Archivo configurado:

El archivo `server/.env` ya está configurado con la URI de conexión correcta.

---

## 🚀 Cómo iniciar el servidor

### Opción 1: Desarrollo (recomendado)

```bash
cd server
npm run dev
```

### Opción 2: Producción

```bash
cd server
npm start
```

---

## ✅ Verificar conexión

Cuando inicies el servidor, deberías ver en la consola:

```
✅ MongoDB conectado: clusterasistencias.8tdcmro.mongodb.net
🚀 Servidor corriendo en puerto 5001
```

Si ves este mensaje, la conexión a MongoDB Atlas fue exitosa.

---

## 🔍 Ventajas de MongoDB Atlas

1. **Base de datos en la nube** - Accesible desde cualquier lugar
2. **Backups automáticos** - Atlas hace respaldos automáticos
3. **Escalabilidad** - Fácil de escalar según necesidades
4. **Monitoreo** - Panel de control con métricas en tiempo real
5. **Seguridad** - Encriptación y autenticación integrada

---

## 📊 Acceder al panel de MongoDB Atlas

1. Ve a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Inicia sesión con tus credenciales
3. Selecciona el proyecto "ClusterAsistencias"
4. Podrás ver:
   - Métricas de uso
   - Colecciones y documentos
   - Logs de conexión
   - Configuración de seguridad

---

## 🗄️ Colecciones en la base de datos

El sistema creará automáticamente estas colecciones:

- `users` - Usuarios del sistema
- `areas` - Áreas/departamentos
- `inhouses` - Empresas in-house con geolocalización
- `attendances` - Registros de asistencia
- `biometrics` - Datos biométricos (si aplica)

---

## 🔒 Seguridad

### IP Whitelist

Por defecto, MongoDB Atlas puede tener restricciones de IP. Asegúrate de:

1. Ir a "Network Access" en Atlas
2. Agregar tu IP actual o permitir acceso desde cualquier IP (0.0.0.0/0) para desarrollo
3. En producción, restringir a IPs específicas

### Credenciales

Las credenciales están en el archivo `.env`:
- **Usuario**: desarrollador_db_user
- **Contraseña**: 0YQAr9BQ4rQj8Slu

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

---

## 🛠️ Troubleshooting

### Error: "MongoServerError: bad auth"

**Solución**: Verifica que las credenciales sean correctas en `.env`

### Error: "MongoNetworkError: connection timeout"

**Soluciones**:
1. Verifica tu conexión a internet
2. Revisa la whitelist de IPs en MongoDB Atlas
3. Asegúrate de que el firewall no bloquee el puerto 27017

### Error: "Database name cannot be empty"

**Solución**: Asegúrate de que la URI incluya el nombre de la base de datos: `/sistema-asistencia`

---

## 📝 Migración de datos

Si tenías datos en MongoDB local y quieres migrarlos a Atlas:

### Exportar desde local:

```bash
mongodump --db sistema-asistencia --out ./backup
```

### Importar a Atlas:

```bash
mongorestore --uri="mongodb+srv://desarrollador_db_user:0YQAr9BQ4rQj8Slu@clusterasistencias.8tdcmro.mongodb.net/sistema-asistencia" ./backup/sistema-asistencia
```

---

## 🔄 Cambiar entre local y Atlas

### Para usar MongoDB local:

Edita `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/sistema-asistencia
```

### Para usar MongoDB Atlas:

Edita `server/.env`:
```env
MONGO_URI=mongodb+srv://desarrollador_db_user:0YQAr9BQ4rQj8Slu@clusterasistencias.8tdcmro.mongodb.net/sistema-asistencia?retryWrites=true&w=majority&appName=ClusterAsistencias
```

Luego reinicia el servidor.

---

## 📈 Monitoreo y métricas

En el panel de MongoDB Atlas puedes ver:

- **Conexiones activas**: Cuántos clientes están conectados
- **Operaciones por segundo**: Lecturas/escrituras
- **Uso de almacenamiento**: Espacio utilizado
- **Índices**: Rendimiento de consultas
- **Logs**: Historial de operaciones

---

## 💾 Límites del plan gratuito (M0)

- **Almacenamiento**: 512 MB
- **RAM**: 512 MB compartida
- **Conexiones simultáneas**: 500
- **Backups**: No automáticos (solo en planes pagos)

Para la mayoría de aplicaciones pequeñas/medianas, esto es suficiente.

---

## 🔐 Mejores prácticas

1. ✅ Usa variables de entorno para credenciales
2. ✅ Restringe IPs en producción
3. ✅ Usa contraseñas fuertes
4. ✅ Habilita autenticación de dos factores en Atlas
5. ✅ Monitorea el uso regularmente
6. ✅ Configura alertas de uso en Atlas
7. ✅ Mantén backups regulares (exportaciones manuales en plan gratuito)

---

## 📞 Soporte

- **Documentación oficial**: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Community Forums**: [https://community.mongodb.com](https://community.mongodb.com)
- **Stack Overflow**: Tag `mongodb-atlas`

---

**Fecha de configuración**: Diciembre 2024  
**Versión de MongoDB**: 7.x (Atlas)  
**Región**: Configurada en Atlas
