# Changelog - Sistema de Geolocalización para InHouses

## Versión 2.0 - Sistema de Geolocalización

### 🎯 Resumen de cambios

Se implementó un sistema completo de geolocalización para InHouses que permite:
- Asociar múltiples áreas a un InHouse
- Definir ubicación geográfica con coordenadas lat/lng
- Validar asistencias por proximidad usando la fórmula de Haversine
- Interfaz con Google Maps para selección de ubicación

---

## 📦 Backend

### Modelos actualizados

#### `InHouse.js`
**Cambios principales:**
- ✅ Cambio de `area` (singular) a `areas` (array) - Soporte para múltiples áreas
- ✅ Nuevo campo `ubicacion` con:
  - `direccion`: String con la dirección física
  - `coordenadas.lat`: Latitud (requerido)
  - `coordenadas.lng`: Longitud (requerido)
  - `radioPermitido`: Radio en metros (default: 100m)
- ✅ Método `validarDistancia(lat, lng)`: Implementa fórmula de Haversine
- ✅ Índice geoespacial para optimizar búsquedas

**Ejemplo de estructura:**
```javascript
{
  nombre: "Empresa ABC",
  areas: ["area_id_1", "area_id_2"],
  ubicacion: {
    direccion: "Av. Reforma 123, CDMX",
    coordenadas: {
      lat: 19.4326,
      lng: -99.1332
    },
    radioPermitido: 100
  },
  encargado: "Juan Pérez",
  correo: "juan@empresa.com"
}
```

#### `Attendance.model.js`
**Cambios principales:**
- ✅ Nuevo campo `ubicacion` con lat/lng del usuario al marcar asistencia
- ✅ Permite auditoría de ubicaciones de registro

---

### Controladores actualizados

#### `inhouse.controller.js`

**`crearInHouse`**
- ✅ Valida que se proporcionen áreas (mínimo 1)
- ✅ Valida coordenadas obligatorias
- ✅ Guarda ubicación completa con radio permitido

**`actualizarInHouse`**
- ✅ Permite actualizar áreas asignadas
- ✅ Permite actualizar ubicación y radio
- ✅ Actualización parcial de coordenadas

**`loginInHouse`**
- ✅ Actualizado para trabajar con múltiples áreas
- ✅ Token JWT incluye array de áreas

**`obtenerInHouses` y `obtenerInHousePorId`**
- ✅ Populate de múltiples áreas
- ✅ Incluye información de ubicación

**`asignarUsuario`**
- ✅ Valida que el usuario pertenezca a una de las áreas del InHouse
- ✅ Soporte para múltiples áreas

**`eliminarInHouse`**
- ✅ Limpia referencias en usuarios asignados
- ✅ Eliminación completa del InHouse

#### `attendance.controller.js`

**`marcarIngreso`**
- ✅ Requiere coordenadas lat/lng del usuario
- ✅ Obtiene el InHouse y valida distancia con Haversine
- ✅ Rechaza si el usuario está fuera del radio permitido
- ✅ Guarda ubicación del usuario en el registro
- ✅ Retorna distancia calculada en la respuesta

**Validaciones implementadas:**
```javascript
// 1. Validar coordenadas
if (!lat || !lng) {
  return error('Se requiere tu ubicación');
}

// 2. Validar distancia
const validacion = inHouse.validarDistancia(lat, lng);
if (!validacion.dentroDelRango) {
  return error(`Estás muy lejos: ${validacion.distancia}m`);
}

// 3. Guardar ubicación
await Attendance.create({
  usuario,
  inHouse,
  ubicacion: { lat, lng }
});
```

---

## 🎨 Frontend

### Nuevos componentes

#### `MapSelector.js`
Componente reutilizable para selección de ubicación en mapa.

**Características:**
- ✅ Integración con Google Maps JavaScript API
- ✅ Integración con Google Places API (autocompletado)
- ✅ Marcador arrastrable
- ✅ Círculo visual del radio permitido
- ✅ Búsqueda de direcciones con autocompletado
- ✅ Botón "Usar mi ubicación actual"
- ✅ Geocodificación inversa (coordenadas → dirección)
- ✅ Click en el mapa para seleccionar ubicación

**Props:**
```javascript
<MapSelector
  lat={19.4326}
  lng={-99.1332}
  onLocationChange={(lat, lng) => {}}
  direccion="Av. Reforma 123"
  onDireccionChange={(dir) => {}}
  radioPermitido={100}
/>
```

#### `InHousesAdmin.js`
Página completa para gestión de InHouses con geolocalización.

**Características:**
- ✅ Vista de tarjetas con todos los InHouses
- ✅ Formulario modal con MapSelector integrado
- ✅ Selección múltiple de áreas (checkboxes)
- ✅ Configuración de radio permitido
- ✅ Validación de coordenadas antes de guardar
- ✅ Vista de áreas asignadas por InHouse
- ✅ Información de ubicación y radio
- ✅ Acciones: Ver, Editar, Eliminar
- ✅ Diseño responsive

**Rutas:**
- `/inhouses` - Gestión completa de InHouses (solo admin)
- `/areas/:areaId/inhouses` - Vista por área (admin/admin_area)

### Componentes actualizados

#### `UserHome.js`
**Cambios en `handleMarcarIngreso`:**
- ✅ Solicita permisos de geolocalización al usuario
- ✅ Obtiene coordenadas GPS con alta precisión
- ✅ Envía lat/lng al backend
- ✅ Manejo de errores de geolocalización:
  - Permission denied
  - Position unavailable
  - Timeout
- ✅ Muestra distancia al InHouse en mensaje de éxito
- ✅ Configuración de geolocalización:
  ```javascript
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
  ```

#### `Navbar.js`
- ✅ Nuevo enlace "In Houses" en menú de navegación
- ✅ Icono Briefcase
- ✅ Visible solo para administradores

#### `App.js`
- ✅ Nueva ruta `/inhouses` para InHousesAdmin
- ✅ Protección de ruta solo para admin

---

## 🔧 Configuración

### Variables de entorno

**Archivo: `client/.env.example`**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

**Instrucciones:**
1. Copiar `.env.example` a `.env`
2. Obtener API Key de Google Cloud Console
3. Habilitar APIs: Maps JavaScript, Places, Geocoding
4. Configurar restricciones de seguridad
5. Agregar la API Key al archivo `.env`

---

## 📐 Fórmula de Haversine

Implementada en `InHouse.validarDistancia()`:

```javascript
const R = 6371e3; // Radio de la Tierra en metros
const φ1 = lat1 * Math.PI / 180;
const φ2 = lat2 * Math.PI / 180;
const Δφ = (lat2 - lat1) * Math.PI / 180;
const Δλ = (lng2 - lng1) * Math.PI / 180;

const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

const distancia = R * c; // Distancia en metros
```

**Retorna:**
```javascript
{
  dentroDelRango: true/false,
  distancia: 85, // metros
  radioPermitido: 100 // metros
}
```

---

## 🔒 Seguridad

### Validaciones implementadas

1. **Backend:**
   - ✅ Coordenadas requeridas al crear InHouse
   - ✅ Validación de distancia con Haversine
   - ✅ Verificación de asignación de usuario a InHouse
   - ✅ Al menos un área requerida por InHouse

2. **Frontend:**
   - ✅ Validación de permisos de geolocalización
   - ✅ Manejo de errores de GPS
   - ✅ Validación de selección de ubicación en mapa
   - ✅ Restricción de API Key por dominio

### Restricciones de API Key

**Recomendado:**
- Restricción por referente HTTP (dominio)
- Restricción por APIs específicas
- Diferentes keys para dev/prod
- Monitoreo de uso

---

## 📊 Flujo de trabajo

### Crear InHouse con geolocalización

1. Admin accede a `/inhouses`
2. Click en "Nuevo In House"
3. Completa formulario:
   - Nombre, encargado, correo, contraseña
   - Selecciona una o más áreas
   - Define radio permitido (default: 100m)
   - Busca dirección o usa ubicación actual
   - Ajusta marcador en el mapa
4. Sistema guarda coordenadas y configuración
5. InHouse queda disponible para asignación de usuarios

### Marcar asistencia con validación de ubicación

1. Usuario accede a `/user/home`
2. Click en "Marcar Ingreso"
3. Selecciona InHouse
4. Sistema solicita permiso de ubicación
5. Usuario acepta permisos
6. Sistema obtiene coordenadas GPS
7. Backend valida distancia con Haversine
8. Si está dentro del radio: ✅ Asistencia registrada
9. Si está fuera del radio: ❌ Error con distancia exacta

---

## 🧪 Testing

### Casos de prueba recomendados

**Backend:**
- [ ] Crear InHouse sin coordenadas (debe fallar)
- [ ] Crear InHouse sin áreas (debe fallar)
- [ ] Validar distancia dentro del radio
- [ ] Validar distancia fuera del radio
- [ ] Asignar usuario de área correcta
- [ ] Asignar usuario de área incorrecta (debe fallar)
- [ ] Actualizar coordenadas de InHouse existente
- [ ] Eliminar InHouse con usuarios asignados

**Frontend:**
- [ ] Cargar mapa correctamente
- [ ] Búsqueda de direcciones con autocompletado
- [ ] Arrastrar marcador actualiza coordenadas
- [ ] Click en mapa actualiza ubicación
- [ ] Botón "Usar mi ubicación" funciona
- [ ] Geocodificación inversa muestra dirección
- [ ] Círculo se ajusta al cambiar radio
- [ ] Marcar asistencia dentro del radio
- [ ] Marcar asistencia fuera del radio (debe fallar)
- [ ] Manejo de permisos de geolocalización denegados

---

## 📝 Migraciones necesarias

### Para InHouses existentes

Si ya tienes InHouses en la base de datos, necesitarás:

1. **Agregar coordenadas manualmente** o
2. **Ejecutar script de migración:**

```javascript
// Script de migración (ejemplo)
const InHouse = require('./models/InHouse');

async function migrarInHouses() {
  const inHouses = await InHouse.find({ 
    'ubicacion.coordenadas.lat': { $exists: false } 
  });
  
  for (const inHouse of inHouses) {
    // Opción 1: Coordenadas por defecto (CDMX)
    inHouse.ubicacion = {
      direccion: 'Por definir',
      coordenadas: {
        lat: 19.4326,
        lng: -99.1332
      },
      radioPermitido: 100
    };
    
    // Convertir area singular a areas array
    if (inHouse.area && !inHouse.areas) {
      inHouse.areas = [inHouse.area];
    }
    
    await inHouse.save();
  }
}
```

---

## 🚀 Próximos pasos

### Mejoras sugeridas

1. **Historial de ubicaciones:**
   - Guardar todas las ubicaciones de asistencia
   - Mapa de calor de registros
   - Detección de patrones anómalos

2. **Reportes:**
   - Asistencias fuera de rango
   - Usuarios que intentaron marcar lejos
   - Estadísticas de distancia promedio

3. **Notificaciones:**
   - Alert cuando usuario intenta marcar fuera del área
   - Email al admin con ubicación del intento

4. **Optimizaciones:**
   - Caché de geocodificación en BD
   - Debouncing en búsqueda de direcciones
   - Lazy loading de Google Maps

5. **Modo offline:**
   - Guardar asistencia localmente
   - Sincronizar cuando haya conexión
   - Validar ubicación al sincronizar

---

## 📚 Documentación adicional

- `CONFIGURACION_GOOGLE_MAPS.md` - Guía completa de configuración
- `README.md` - Documentación general del proyecto
- `COMO_LEVANTAR.md` - Instrucciones de instalación

---

## 🐛 Problemas conocidos

### Limitaciones actuales

1. **Precisión GPS:**
   - Varía según dispositivo (5-50m típicamente)
   - Puede ser afectada por edificios altos
   - Mejor precisión en exteriores

2. **Permisos del navegador:**
   - Requiere HTTPS en producción
   - Usuario puede denegar permisos
   - Algunos navegadores bloquean geolocalización

3. **Costos de Google Maps:**
   - Monitorear uso mensual
   - Configurar alertas de facturación
   - Optimizar llamadas a la API

### Soluciones propuestas

- Aumentar radio permitido si hay problemas de precisión
- Implementar fallback manual de ubicación
- Caché agresivo de geocodificación
- Considerar alternativas a Google Maps (OpenStreetMap)

---

## 👥 Contribuciones

Al contribuir a este módulo, considera:

- Mantener la precisión de la fórmula de Haversine
- Optimizar llamadas a Google Maps API
- Documentar cambios en este archivo
- Agregar tests para nuevas funcionalidades
- Seguir las convenciones de código existentes

---

**Fecha de implementación:** Diciembre 2024  
**Versión:** 2.0.0  
**Autor:** Sistema de Asistencia Team
