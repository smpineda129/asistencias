# 🚀 Inicio Rápido - Geolocalización

## Pasos para activar el sistema de geolocalización

### 1️⃣ Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Crea una API Key en "Credenciales"
5. Copia la API Key

### 2️⃣ Configurar el Frontend

```bash
cd client
cp .env.example .env
```

Edita `client/.env` y agrega tu API Key:
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

### 3️⃣ Instalar dependencias (si es necesario)

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4️⃣ Iniciar el sistema

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### 5️⃣ Usar el sistema

1. **Login como Admin:**
   - Ve a `http://localhost:3000/login`
   - Usa credenciales de admin

2. **Crear un InHouse con geolocalización:**
   - Click en "In Houses" en el menú
   - Click en "Nuevo In House"
   - Completa el formulario:
     - Nombre, encargado, correo, contraseña
     - Selecciona una o más áreas
     - Busca una dirección o usa "Usar mi ubicación actual"
     - Ajusta el marcador en el mapa si es necesario
     - Configura el radio permitido (default: 100m)
   - Click en "Crear"

3. **Asignar usuarios al InHouse:**
   - En la tarjeta del InHouse, click en "Ver"
   - Click en "Asignar Usuario"
   - Selecciona usuarios del área

4. **Marcar asistencia con validación de ubicación:**
   - Login como usuario normal
   - Click en "Marcar Ingreso"
   - Selecciona el InHouse
   - Permite acceso a tu ubicación cuando el navegador lo solicite
   - El sistema validará que estés dentro del radio permitido
   - ✅ Si estás cerca: Asistencia registrada
   - ❌ Si estás lejos: Error con la distancia exacta

## ⚠️ Importante

### Permisos de geolocalización

El navegador solicitará permiso para acceder a tu ubicación. Debes aceptar para poder marcar asistencia.

**En Chrome:**
- Click en el icono de candado/información en la barra de direcciones
- Permite "Ubicación"

**En Firefox:**
- Click en el icono de información en la barra de direcciones
- Permisos > Ubicación > Permitir

### HTTPS en producción

Para producción, **DEBES usar HTTPS**. Los navegadores modernos bloquean la geolocalización en sitios HTTP (excepto localhost).

### Restricciones de API Key

Para evitar uso no autorizado y costos inesperados:

1. Ve a Google Cloud Console > Credenciales
2. Click en tu API Key
3. En "Restricciones de aplicación":
   - Selecciona "Referentes HTTP"
   - Agrega: `http://localhost:3000/*` (desarrollo)
   - Agrega: `https://tudominio.com/*` (producción)
4. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Marca solo: Maps JavaScript API, Places API, Geocoding API

## 🧪 Probar el sistema

### Escenario 1: Dentro del radio ✅

1. Crea un InHouse con tu ubicación actual
2. Radio: 100m
3. Marca asistencia desde el mismo lugar
4. Resultado: ✅ Asistencia registrada

### Escenario 2: Fuera del radio ❌

1. Usa el mismo InHouse
2. Intenta marcar desde otra ubicación (>100m)
3. Resultado: ❌ Error "Estás muy lejos del In House. Distancia: XXXm"

### Escenario 3: Múltiples áreas

1. Crea un InHouse con 2 áreas diferentes
2. Asigna usuarios de ambas áreas
3. Ambos pueden marcar asistencia en el mismo InHouse

## 📱 Modo desarrollo sin GPS

Si estás desarrollando sin acceso a GPS real:

1. En Chrome DevTools (F12):
   - Click en los 3 puntos > More tools > Sensors
   - En "Location", selecciona una ubicación predefinida
   - O ingresa coordenadas personalizadas

2. En Firefox:
   - about:config
   - Busca `geo.enabled`
   - O usa extensiones de geolocalización falsa

## 🆘 Solución de problemas

### "This page can't load Google Maps correctly"
- Verifica que la API Key esté en `.env`
- Reinicia el servidor frontend después de modificar `.env`
- Verifica que las APIs estén habilitadas en Google Cloud

### "Geolocation permission denied"
- Revisa los permisos del navegador
- En producción, asegúrate de usar HTTPS

### El mapa no se muestra
- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que `REACT_APP_GOOGLE_MAPS_API_KEY` esté definida

### "Estás muy lejos del In House"
- Verifica que estés físicamente cerca del InHouse
- Aumenta el radio permitido si es necesario
- Revisa la precisión del GPS de tu dispositivo

## 📚 Más información

- `CONFIGURACION_GOOGLE_MAPS.md` - Guía detallada de configuración
- `CHANGELOG_GEOLOCALIZACION.md` - Documentación técnica completa
- `README.md` - Documentación general del proyecto

## 💡 Tips

1. **Desarrollo local**: Usa radio de 500m para pruebas más fáciles
2. **Producción**: Ajusta el radio según las necesidades (50-200m típicamente)
3. **Precisión GPS**: Mejor en exteriores, puede variar 5-50m
4. **Costos**: $200 USD gratis mensualmente en Google Maps API

---

¡Listo! Ahora puedes crear InHouses con geolocalización y validar asistencias por proximidad. 🎉
