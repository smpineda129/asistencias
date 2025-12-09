# Configuración de Google Maps API

Este documento explica cómo configurar Google Maps API para el sistema de geolocalización de InHouses.

## Pasos para obtener la API Key

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Asegúrate de tener habilitada la facturación (Google ofrece $200 de crédito gratis)

### 2. Habilitar las APIs necesarias

Debes habilitar las siguientes APIs:

1. **Maps JavaScript API** - Para mostrar mapas interactivos
2. **Places API** - Para búsqueda de direcciones y autocompletado
3. **Geocoding API** - Para convertir coordenadas en direcciones y viceversa

Para habilitarlas:
- Ve a "APIs y servicios" > "Biblioteca"
- Busca cada API y haz clic en "Habilitar"

### 3. Crear credenciales (API Key)

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "+ CREAR CREDENCIALES" > "Clave de API"
3. Se generará tu API Key
4. **IMPORTANTE**: Restringe tu API Key para mayor seguridad

### 4. Restringir la API Key (Recomendado)

#### Restricciones de aplicación:
- **Para desarrollo local**: Selecciona "Referentes HTTP" y agrega:
  - `http://localhost:3000/*`
  - `http://localhost:5001/*`

- **Para producción**: Agrega tu dominio:
  - `https://tudominio.com/*`

#### Restricciones de API:
Selecciona "Restringir clave" y marca solo:
- Maps JavaScript API
- Places API
- Geocoding API

### 5. Configurar en el proyecto

#### Frontend (React)

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cd client
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tu API Key:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm start
   ```

## Funcionalidades implementadas

### 1. Gestión de InHouses con Geolocalización

- **Crear InHouse**: Selecciona ubicación en el mapa con marcador arrastrable
- **Editar InHouse**: Actualiza coordenadas y radio permitido
- **Búsqueda de direcciones**: Autocompletado con Google Places
- **Radio de geovalla**: Círculo visual que muestra el área permitida (default: 100m)

### 2. Validación de Asistencia

- **Captura de ubicación**: Al marcar ingreso, se obtiene la ubicación GPS del usuario
- **Validación Haversine**: Se calcula la distancia entre el usuario y el InHouse
- **Restricción por distancia**: Solo permite marcar asistencia si está dentro del radio permitido
- **Feedback visual**: Muestra la distancia exacta al usuario

### 3. Múltiples Áreas por InHouse

- Un InHouse puede estar asociado a múltiples áreas
- Los usuarios de cualquiera de esas áreas pueden ser asignados al InHouse
- Facilita la gestión de empresas que trabajan con varios departamentos

## Fórmula de Haversine

La distancia entre dos puntos geográficos se calcula usando:

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

const distancia = R * c; // en metros
```

## Costos de Google Maps API

### Precios (al momento de escribir esto):

- **Maps JavaScript API**: $7 por 1,000 cargas de mapa
- **Places API (Autocomplete)**: $2.83 por 1,000 solicitudes
- **Geocoding API**: $5 por 1,000 solicitudes

### Crédito gratuito mensual:
- $200 USD de crédito mensual gratuito
- Esto equivale aproximadamente a:
  - ~28,500 cargas de mapa
  - ~70,600 búsquedas de autocompletado
  - ~40,000 geocodificaciones

### Recomendaciones para optimizar costos:

1. **Cachear resultados**: Guarda direcciones geocodificadas en la BD
2. **Limitar búsquedas**: Implementa debouncing en el autocompletado
3. **Restricciones de API Key**: Evita uso no autorizado
4. **Monitoreo**: Configura alertas de facturación en Google Cloud

## Troubleshooting

### Error: "This page can't load Google Maps correctly"

**Solución**: Verifica que:
1. La API Key esté correctamente configurada en `.env`
2. Las APIs estén habilitadas en Google Cloud Console
3. Las restricciones de la API Key permitan tu dominio/localhost

### Error: "Geolocation permission denied"

**Solución**: 
1. El usuario debe permitir el acceso a la ubicación en el navegador
2. En producción, el sitio debe usar HTTPS (requerido por navegadores modernos)

### El mapa no se muestra

**Solución**:
1. Abre la consola del navegador y busca errores
2. Verifica que `REACT_APP_GOOGLE_MAPS_API_KEY` esté definida
3. Reinicia el servidor después de modificar `.env`

## Seguridad

### ⚠️ NUNCA hagas lo siguiente:

- ❌ Subir el archivo `.env` a Git (ya está en `.gitignore`)
- ❌ Compartir tu API Key públicamente
- ❌ Dejar la API Key sin restricciones
- ❌ Usar la misma API Key para desarrollo y producción

### ✅ Buenas prácticas:

- ✅ Usa diferentes API Keys para dev/staging/prod
- ✅ Configura restricciones de dominio
- ✅ Monitorea el uso en Google Cloud Console
- ✅ Rota las API Keys periódicamente
- ✅ Configura alertas de facturación

## Soporte

Si tienes problemas con la configuración:

1. Revisa la [documentación oficial de Google Maps](https://developers.google.com/maps/documentation)
2. Verifica los logs del navegador (F12 > Console)
3. Revisa los logs del servidor backend
4. Consulta el panel de Google Cloud Console para errores de API

## Próximas mejoras sugeridas

- [ ] Implementar caché de geocodificación en la BD
- [ ] Agregar historial de ubicaciones por asistencia
- [ ] Visualización de mapa de calor de asistencias
- [ ] Reportes de asistencias fuera de rango
- [ ] Notificaciones cuando un usuario intenta marcar fuera del área
- [ ] Modo offline con sincronización posterior
