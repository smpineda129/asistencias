# 🚀 Plan de Escalabilidad - Sistema de Asistencia

Este documento describe las estrategias y tecnologías para escalar el sistema y agregar nuevas funcionalidades biométricas.

---

## 📊 Arquitectura Actual vs Futura

### Arquitectura Actual (Monolítica)
```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   Node.js   │
│   Express   │
└──────┬──────┘
       │
┌──────▼──────┐
│   MongoDB   │
└─────────────┘
```

### Arquitectura Escalable (Microservicios)
```
                    ┌──────────────┐
                    │  Load        │
                    │  Balancer    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │  Auth   │       │Attendance │     │Biometric  │
   │ Service │       │  Service  │     │  Service  │
   └────┬────┘       └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Message    │
                    │    Queue     │
                    │  (RabbitMQ)  │
                    └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │MongoDB  │       │  Redis    │     │    S3     │
   │ Cluster │       │  Cache    │     │  Storage  │
   └─────────┘       └───────────┘     └───────────┘
```

---

## 🔐 Implementación de Biometría

### 1. Sistema de Huellas Dactilares

#### Hardware Requerido
- **Lector de huellas USB**: Digital Persona U.are.U 4500
- **Alternativa**: ZKTeco ZK9500
- **Costo aproximado**: $150 - $300 USD

#### Software y Librerías

##### Backend
```bash
npm install @digitalpersona/devices @digitalpersona/core
```

##### Arquitectura
```javascript
// Nuevo microservicio: biometric-service

const express = require('express');
const { FingerprintReader } = require('@digitalpersona/devices');

class BiometricService {
  constructor() {
    this.reader = new FingerprintReader();
  }

  async captureFinger print() {
    return new Promise((resolve, reject) => {
      this.reader.startAcquisition()
        .then(sample => {
          // Convertir muestra a template
          const template = this.createTemplate(sample);
          resolve(template);
        })
        .catch(reject);
    });
  }

  async verifyFingerprint(capturedTemplate, storedTemplate) {
    // Comparar templates
    const score = this.compareTemplates(capturedTemplate, storedTemplate);
    return score > 0.7; // 70% de coincidencia
  }
}
```

#### Modelo de Datos
```javascript
const biometricSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['huella', 'facial', 'iris'],
    required: true
  },
  template: {
    type: String, // Template encriptado
    required: true
  },
  dedo: {
    type: String,
    enum: ['pulgar_derecho', 'indice_derecho', 'medio_derecho', 
           'pulgar_izquierdo', 'indice_izquierdo', 'medio_izquierdo']
  },
  calidad: {
    type: Number, // 0-100
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
```

#### API Endpoints
```javascript
// POST /api/biometric/enroll
// Registrar nueva huella
router.post('/enroll', async (req, res) => {
  const { usuarioId, dedo } = req.body;
  
  // Capturar 3 muestras para mejor precisión
  const samples = [];
  for (let i = 0; i < 3; i++) {
    const sample = await biometricService.captureFingerprint();
    samples.push(sample);
  }
  
  // Crear template consolidado
  const template = await biometricService.createTemplate(samples);
  
  // Guardar en BD (encriptado)
  const biometric = await Biometric.create({
    usuario: usuarioId,
    tipo: 'huella',
    template: encrypt(template),
    dedo,
    calidad: calculateQuality(samples)
  });
  
  res.json({ success: true, biometric });
});

// POST /api/biometric/verify
// Verificar huella y marcar asistencia
router.post('/verify', async (req, res) => {
  // Capturar huella
  const capturedTemplate = await biometricService.captureFingerprint();
  
  // Buscar coincidencia en BD
  const biometrics = await Biometric.find({ activo: true });
  
  for (const bio of biometrics) {
    const storedTemplate = decrypt(bio.template);
    const isMatch = await biometricService.verifyFingerprint(
      capturedTemplate, 
      storedTemplate
    );
    
    if (isMatch) {
      // Marcar asistencia automáticamente
      const asistencia = await marcarIngreso(bio.usuario);
      return res.json({ 
        success: true, 
        usuario: bio.usuario,
        asistencia 
      });
    }
  }
  
  res.status(404).json({ 
    success: false, 
    message: 'Huella no reconocida' 
  });
});
```

---

### 2. Reconocimiento Facial

#### Tecnologías Recomendadas

##### Opción A: Face-API.js (JavaScript)
```bash
npm install face-api.js
```

**Ventajas:**
- Funciona en navegador
- No requiere servidor adicional
- Gratis y open source

**Desventajas:**
- Menos preciso que soluciones cloud
- Requiere buena iluminación

##### Opción B: AWS Rekognition
```bash
npm install aws-sdk
```

**Ventajas:**
- Alta precisión (99%+)
- Detección de vivacidad (anti-spoofing)
- Escalable

**Desventajas:**
- Costo por uso (0.1 centavo por imagen x 1000000, despues 0.08 por imagen) 
- Requiere conexión a internet

#### Implementación con Face-API.js

```javascript
// Frontend - Captura facial
import * as faceapi from 'face-api.js';

class FacialRecognition {
  async initialize() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  }

  async captureAndEnroll(video, userId) {
    const detections = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      throw new Error('No se detectó rostro');
    }

    // Enviar descriptor al backend
    await api.post('/biometric/enroll-face', {
      usuarioId: userId,
      descriptor: Array.from(detections.descriptor)
    });
  }

  async verifyAndCheckIn(video) {
    const detections = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      throw new Error('No se detectó rostro');
    }

    // Verificar con backend
    const response = await api.post('/biometric/verify-face', {
      descriptor: Array.from(detections.descriptor)
    });
    
    return response.data;
  }
}
```

#### Backend - Comparación
```javascript
const euclideanDistance = (a, b) => {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  );
};

router.post('/verify-face', async (req, res) => {
  const { descriptor } = req.body;
  
  const biometrics = await Biometric.find({ 
    tipo: 'facial', 
    activo: true 
  }).populate('usuario');
  
  let bestMatch = null;
  let bestDistance = Infinity;
  
  for (const bio of biometrics) {
    const storedDescriptor = JSON.parse(decrypt(bio.template));
    const distance = euclideanDistance(descriptor, storedDescriptor);
    
    if (distance < bestDistance && distance < 0.6) {
      bestDistance = distance;
      bestMatch = bio;
    }
  }
  
  if (bestMatch) {
    const asistencia = await marcarIngreso(bestMatch.usuario._id);
    return res.json({
      success: true,
      usuario: bestMatch.usuario,
      confidence: (1 - bestDistance) * 100,
      asistencia
    });
  }
  
  res.status(404).json({
    success: false,
    message: 'Rostro no reconocido'
  });
});
```

---

## 📱 Aplicación Móvil con Biometría

### React Native + Biometría

```bash
npm install react-native-fingerprint-scanner
npm install react-native-camera
```

#### Huella Dactilar en Móvil
```javascript
import FingerprintScanner from 'react-native-fingerprint-scanner';

const authenticateWithFingerprint = async () => {
  try {
    await FingerprintScanner.authenticate({
      description: 'Escanea tu huella para marcar asistencia'
    });
    
    // Huella verificada localmente
    // Enviar confirmación al servidor
    await api.post('/attendance/ingreso-biometric', {
      tipo: 'huella_movil',
      deviceId: DeviceInfo.getUniqueId()
    });
    
  } catch (error) {
    console.error('Error de autenticación', error);
  }
};
```

#### Reconocimiento Facial en Móvil
```javascript
import { RNCamera } from 'react-native-camera';

const FacialCheckIn = () => {
  const takePicture = async (camera) => {
    const options = { quality: 0.8, base64: true };
    const data = await camera.takePictureAsync(options);
    
    // Enviar imagen al servidor para verificación
    const response = await api.post('/biometric/verify-face-mobile', {
      image: data.base64
    });
    
    if (response.data.success) {
      Alert.alert('Éxito', 'Asistencia marcada correctamente');
    }
  };

  return (
    <RNCamera
      type={RNCamera.Constants.Type.front}
      captureAudio={false}
      androidCameraPermissionOptions={{
        title: 'Permiso de cámara',
        message: 'Necesitamos acceso a la cámara'
      }}
    />
  );
};
```

---

## 🔄 Sistema Híbrido (Recomendado)

### Múltiples Métodos de Autenticación

```javascript
const authMethods = {
  PASSWORD: 'password',
  FINGERPRINT: 'fingerprint',
  FACIAL: 'facial',
  QR_CODE: 'qr',
  NFC: 'nfc'
};

// Configuración por usuario
const userAuthSchema = new mongoose.Schema({
  usuario: { type: ObjectId, ref: 'User' },
  metodosHabilitados: [{
    type: String,
    enum: Object.values(authMethods)
  }],
  metodoPreferido: {
    type: String,
    enum: Object.values(authMethods)
  },
  requiereDobleFactortor: Boolean
});
```

---

## 🏗️ Infraestructura Escalable

### 1. Load Balancing

#### Nginx Load Balancer
```nginx
upstream backend {
    least_conn;
    server backend1.example.com:5001 weight=3;
    server backend2.example.com:5001 weight=2;
    server backend3.example.com:5001 weight=1;
}

server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Caché con Redis

```javascript
const redis = require('redis');
const client = redis.createClient();

// Middleware de caché
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usar en rutas
router.get('/estadisticas', cacheMiddleware(300), obtenerEstadisticas);
```

### 3. Message Queue para Procesos Pesados

```javascript
const amqp = require('amqplib');

// Productor - Enviar tarea
async function sendBiometricProcessing(userId, imageData) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('biometric_processing');
  channel.sendToQueue('biometric_processing', Buffer.from(JSON.stringify({
    userId,
    imageData,
    timestamp: Date.now()
  })));
}

// Consumidor - Procesar tarea
async function processBiometricQueue() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('biometric_processing');
  
  channel.consume('biometric_processing', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    
    // Procesar reconocimiento facial (proceso pesado)
    const result = await processeFacialRecognition(data);
    
    // Guardar resultado
    await saveResult(result);
    
    channel.ack(msg);
  });
}
```

---

## 📊 Monitoreo y Analytics

### Métricas Importantes

1. **Rendimiento**
   - Tiempo de respuesta API
   - Tiempo de verificación biométrica
   - Tasa de éxito de reconocimiento

2. **Uso**
   - Asistencias por hora/día
   - Método de autenticación más usado
   - Usuarios activos

3. **Errores**
   - Falsos positivos/negativos
   - Errores de captura
   - Timeouts

### Implementación con Prometheus + Grafana

```javascript
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const biometricVerifications = new promClient.Counter({
  name: 'biometric_verifications_total',
  help: 'Total number of biometric verifications',
  labelNames: ['type', 'result']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

---

## 💰 Estimación de Costos

### Infraestructura Básica (100 usuarios)
- **MongoDB Atlas**: $0 (M0 Free Tier)
- **AWS EC2 t2.small**: $17/mes
- **Dominio**: $12/año
- **SSL Certificate**: $0 (Let's Encrypt)
- **Total**: ~$17/mes

### Infraestructura Escalable (1000+ usuarios)
- **MongoDB Atlas M10**: $57/mes
- **AWS EC2 t3.medium x2**: $60/mes
- **Load Balancer**: $16/mes
- **Redis ElastiCache**: $13/mes
- **S3 Storage**: $5/mes
- **CloudFront CDN**: $10/mes
- **Total**: ~$161/mes

### Con Biometría Cloud
- **AWS Rekognition**: $1 por 1000 imágenes
- **Azure Face API**: $1 por 1000 transacciones
- **Estimado adicional**: $20-50/mes

---

## 🎯 Roadmap de Implementación

### Fase 1: Optimización Actual (1-2 meses)
- [ ] Implementar caché con Redis
- [ ] Optimizar consultas MongoDB
- [ ] Agregar índices en BD
- [ ] Implementar rate limiting
- [ ] Configurar monitoreo básico

### Fase 2: Biometría Básica (2-3 meses)
- [ ] Implementar sistema de huellas dactilares
- [ ] Crear módulo de registro biométrico
- [ ] Desarrollar API de verificación
- [ ] Testing y ajuste de precisión
- [ ] Capacitación de usuarios

### Fase 3: Reconocimiento Facial (3-4 meses)
- [ ] Integrar Face-API.js o AWS Rekognition
- [ ] Desarrollar interfaz de captura
- [ ] Implementar anti-spoofing
- [ ] Testing en diferentes condiciones
- [ ] Documentación y capacitación

### Fase 4: App Móvil (4-6 meses)
- [ ] Desarrollar app React Native
- [ ] Integrar biometría móvil
- [ ] Implementar geolocalización
- [ ] Modo offline
- [ ] Publicar en stores

### Fase 5: Microservicios (6-12 meses)
- [ ] Separar servicios
- [ ] Implementar message queue
- [ ] Configurar load balancing
- [ ] Migrar a arquitectura cloud
- [ ] Implementar CI/CD completo

---

## 📚 Recursos Adicionales

### Documentación
- [Face-API.js](https://github.com/justadudewhohacks/face-api.js)
- [AWS Rekognition](https://docs.aws.amazon.com/rekognition/)
- [Digital Persona SDK](https://www.digitalpersona.com/developers/)

### Librerías Útiles
- `face-api.js` - Reconocimiento facial en JavaScript
- `fingerprint-scanner` - Lectura de huellas
- `sharp` - Procesamiento de imágenes
- `bull` - Queue system para Node.js
- `ioredis` - Cliente Redis avanzado

### Consideraciones Legales
- **GDPR**: Datos biométricos son categoría especial
- **Consentimiento**: Requerido y explícito
- **Almacenamiento**: Encriptado y seguro
- **Retención**: Política clara de eliminación
- **Auditoría**: Logs de acceso a datos biométricos

---

## 🔐 Seguridad Biométrica

### Best Practices

1. **Nunca almacenar datos raw**
   - Solo templates/descriptores
   - Encriptación AES-256
   - Keys en HSM o KMS

2. **Anti-spoofing**
   - Detección de vivacidad
   - Análisis de profundidad (3D)
   - Detección de movimiento

3. **Fallback methods**
   - Siempre tener método alternativo
   - PIN de emergencia
   - Verificación manual por admin

4. **Auditoría**
   - Log de todos los intentos
   - Alertas de intentos fallidos
   - Revisión periódica

---

## 📞 Contacto y Soporte

Para consultas sobre escalabilidad o implementación biométrica:
- **Email**: arquitectura@empresa.com
- **Slack**: #sistema-asistencia
- **Wiki**: https://wiki.empresa.com/asistencia
