# 🔐 Guía de Implementación del Sistema Biométrico

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Hardware Requerido](#hardware-requerido)
3. [Instalación del SDK](#instalación-del-sdk)
4. [Configuración del Sistema](#configuración-del-sistema)
5. [Uso del Sistema](#uso-del-sistema)
6. [Solución de Problemas](#solución-de-problemas)
7. [Seguridad](#seguridad)
8. [API Reference](#api-reference)

---

## 📖 Descripción General

El sistema biométrico integrado permite el control de asistencia mediante huellas dactilares usando el lector **DigitalPersona U.are.U 4500**. 

### Características Principales

- ✅ Registro de múltiples huellas por usuario (hasta 10 dedos)
- ✅ Verificación rápida (< 2 segundos)
- ✅ Marcación automática de ingreso/salida
- ✅ Terminal de marcación en pantalla completa
- ✅ Gestión centralizada de huellas
- ✅ Encriptación de templates biométricos
- ✅ Estadísticas de uso

---

## 🖥️ Hardware Requerido

### Lector de Huellas

**Modelo:** DigitalPersona U.are.U 4500 (HID)

**Especificaciones:**
- Resolución: 500 DPI
- Tecnología: Óptica
- Interfaz: USB 2.0
- Compatibilidad: Windows, macOS, Linux
- Área de captura: 16mm x 18mm

**Dónde Comprar:**
- Amazon
- Mercado Libre
- Distribuidores HID autorizados

**Precio Aproximado:** $150 - $250 USD

---

## 💿 Instalación del SDK

### Paso 1: Descargar el SDK

1. Visite el sitio oficial de DigitalPersona:
   ```
   https://www.digitalpersona.com/support/
   ```

2. Descargue el **DigitalPersona U.are.U SDK** para su sistema operativo

3. Descargue también el **WebSDK** para integración con navegadores

### Paso 2: Instalar el SDK

#### Windows

```bash
# Ejecutar el instalador descargado
DigitalPersona_SDK_Setup.exe

# Seguir el asistente de instalación
# Instalar en la ruta por defecto: C:\Program Files\DigitalPersona\
```

#### macOS

```bash
# Montar el DMG descargado
open DigitalPersona_SDK.dmg

# Arrastrar a Applications
# Ejecutar el instalador
```

#### Linux

```bash
# Descomprimir el paquete
tar -xzf digitalpersona-sdk-linux.tar.gz

# Instalar dependencias
sudo apt-get install libusb-1.0-0-dev

# Ejecutar instalador
sudo ./install.sh
```

### Paso 3: Instalar el Servicio WebSDK

El WebSDK permite que el navegador se comunique con el lector de huellas.

1. Ejecutar el instalador del WebSDK
2. El servicio se instalará y correrá en `https://localhost:8443`
3. Verificar que el servicio esté corriendo:

```bash
# Windows
netstat -an | findstr 8443

# macOS/Linux
netstat -an | grep 8443
```

### Paso 4: Configurar el Frontend

Agregar el script del WebSDK en `client/public/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sistema de Asistencia</title>
    
    <!-- DigitalPersona WebSDK -->
    <script src="https://localhost:8443/websdk/websdk-bundle.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Nota:** El navegador mostrará una advertencia de certificado autofirmado. Debe aceptarlo para que funcione.

---

## ⚙️ Configuración del Sistema

### 1. Variables de Entorno

Agregar en `server/.env`:

```env
# Clave de encriptación para templates biométricos (32 caracteres)
BIOMETRIC_ENCRYPTION_KEY=tu-clave-super-secreta-de-32-caracteres-minimo

# Otras configuraciones
PORT=5001
MONGO_URI=mongodb://localhost:27017/sistema-asistencia
```

**⚠️ IMPORTANTE:** La clave de encriptación debe ser única y segura. Nunca compartirla.

### 2. Instalar Dependencias del Servidor

```bash
cd server
npm install
```

No se requieren dependencias adicionales, el sistema usa módulos nativos de Node.js.

### 3. Iniciar el Servidor

```bash
cd server
npm run dev
```

### 4. Iniciar el Cliente

```bash
cd client
npm start
```

---

## 🎯 Uso del Sistema

### Para Administradores

#### 1. Registrar Huellas de Usuarios

1. Iniciar sesión como administrador
2. Ir a **Biometría** en el menú
3. Buscar el usuario deseado
4. Hacer clic en **Registrar Huella**
5. Seleccionar el dedo a registrar
6. Colocar el dedo en el lector 3 veces
7. El sistema guardará la huella con mejor calidad

#### 2. Ver Estadísticas

En la página de Biometría se muestran:
- Total de huellas registradas
- Usuarios con huellas configuradas
- Porcentaje de cobertura
- Huellas más usadas

#### 3. Eliminar Huellas

1. En la lista de usuarios, expandir las huellas registradas
2. Hacer hover sobre la huella a eliminar
3. Hacer clic en el ícono de basura
4. Confirmar la eliminación

### Para Usuarios (Terminal de Marcación)

#### Acceder al Terminal

Abrir en el navegador:
```
http://localhost:3000/terminal
```

**Recomendación:** Usar en modo pantalla completa (F11)

#### Marcar Asistencia

1. El terminal estará en modo de espera
2. Colocar el dedo en el lector
3. El sistema verificará automáticamente
4. Se mostrará confirmación de ingreso o salida
5. El terminal volverá a modo de espera

**Lógica de Marcación:**
- Si no hay ingreso activo → Marca **INGRESO**
- Si hay ingreso activo → Marca **SALIDA**

---

## 🔧 Solución de Problemas

### Problema: "Lector No Disponible"

**Causas posibles:**
1. Lector no conectado
2. Servicio WebSDK no está corriendo
3. Drivers no instalados

**Solución:**
```bash
# Verificar que el lector esté conectado
# Windows
devmgmt.msc  # Buscar en "Dispositivos de imagen"

# Verificar servicio WebSDK
# Windows
services.msc  # Buscar "DigitalPersona WebSDK Service"

# macOS/Linux
ps aux | grep digitalpersona
```

### Problema: "SDK no está cargado"

**Causa:** El script del WebSDK no se cargó correctamente

**Solución:**
1. Verificar que el servicio esté corriendo en `https://localhost:8443`
2. Abrir `https://localhost:8443` en el navegador
3. Aceptar el certificado autofirmado
4. Recargar la aplicación

### Problema: "Huella no reconocida"

**Causas posibles:**
1. Dedo sucio o húmedo
2. Presión incorrecta
3. Calidad de registro baja

**Solución:**
1. Limpiar el dedo y el lector
2. Presionar firmemente pero sin exceso
3. Re-registrar la huella si persiste el problema

### Problema: "Error al encriptar datos biométricos"

**Causa:** Variable de entorno `BIOMETRIC_ENCRYPTION_KEY` no configurada

**Solución:**
```bash
# Agregar en server/.env
BIOMETRIC_ENCRYPTION_KEY=clave-segura-de-minimo-32-caracteres-aqui
```

### Problema: Certificado SSL en Desarrollo

El WebSDK usa HTTPS con certificado autofirmado.

**Solución:**
1. Abrir `https://localhost:8443` en el navegador
2. Hacer clic en "Avanzado" o "Advanced"
3. Hacer clic en "Continuar a localhost (no seguro)"
4. El navegador recordará la excepción

---

## 🔒 Seguridad

### Encriptación de Templates

Los templates biométricos se encriptan usando **AES-256-CBC** antes de almacenarse en la base de datos.

```javascript
// Ejemplo de encriptación
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.BIOMETRIC_ENCRYPTION_KEY, 'salt', 32);
```

### Mejores Prácticas

1. **Nunca almacenar imágenes de huellas**
   - Solo se almacenan templates (características matemáticas)
   - No es posible reconstruir la huella desde el template

2. **Rotar claves de encriptación**
   - Cambiar `BIOMETRIC_ENCRYPTION_KEY` periódicamente
   - Usar un gestor de secretos en producción (AWS KMS, Azure Key Vault)

3. **Auditoría**
   - Todos los intentos de verificación se registran
   - Revisar logs periódicamente

4. **Acceso al Terminal**
   - Colocar en red interna
   - Usar firewall para restringir acceso
   - Considerar autenticación adicional si es necesario

### Cumplimiento Legal

**GDPR / Protección de Datos:**
- Los datos biométricos son categoría especial
- Requiere consentimiento explícito del usuario
- Debe haber política de retención y eliminación
- Derecho al olvido: permitir eliminar huellas

**Recomendaciones:**
1. Obtener consentimiento por escrito
2. Documentar el procesamiento de datos
3. Implementar política de retención (ej: eliminar al terminar contrato)
4. Designar un responsable de protección de datos

---

## 📡 API Reference

### Endpoints Biométricos

#### POST `/api/biometric/enroll`
Registrar una nueva huella

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "usuarioId": "507f1f77bcf86cd799439011",
  "template": "base64_encoded_fmd_template",
  "dedo": "indice_derecho",
  "calidad": 85,
  "deviceInfo": {
    "modelo": "DigitalPersona 4500",
    "serial": "ABC123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Huella registrada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "usuario": {...},
    "dedo": "indice_derecho",
    "calidad": 85,
    "fechaRegistro": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/api/biometric/verify`
Verificar huella y marcar asistencia

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "template": "base64_encoded_fmd_template",
  "inHouseId": "507f1f77bcf86cd799439013"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Ingreso registrado exitosamente",
  "data": {
    "action": "ingreso",
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "nombreCompleto": "Juan Pérez"
    },
    "asistencia": {
      "id": "507f1f77bcf86cd799439014",
      "fecha": "2024-01-15T10:30:00Z",
      "horaIngreso": "10:30",
      "horaSalida": null,
      "estado": "activo"
    },
    "biometric": {
      "dedo": "indice_derecho",
      "calidad": 85,
      "confidence": 98
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Huella no reconocida. Por favor intente nuevamente."
}
```

#### GET `/api/biometric/user/:usuarioId`
Obtener huellas de un usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "dedo": "indice_derecho",
      "calidad": 85,
      "activo": true,
      "ultimoUso": "2024-01-15T10:30:00Z",
      "vecesUsado": 42,
      "fechaRegistro": "2024-01-01T08:00:00Z"
    }
  ]
}
```

#### DELETE `/api/biometric/:id`
Eliminar una huella

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Huella eliminada exitosamente"
}
```

#### GET `/api/biometric/stats`
Obtener estadísticas del sistema biométrico

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "totalHuellas": 45,
      "usuariosConHuella": 23,
      "totalUsuarios": 50,
      "porcentajeCobertura": "46.00"
    },
    "recientes": [...],
    "masUsadas": [...]
  }
}
```

---

## 🚀 Despliegue en Producción

### Consideraciones

1. **Servidor Dedicado**
   - Instalar el lector en una PC dedicada en la entrada
   - Configurar inicio automático del navegador en modo kiosko

2. **Configuración de Kiosko**

**Windows:**
```batch
@echo off
start chrome --kiosk --app=http://localhost:3000/terminal
```

**Linux:**
```bash
#!/bin/bash
chromium-browser --kiosk --app=http://localhost:3000/terminal
```

3. **Seguridad de Red**
   - Usar HTTPS en producción
   - Configurar firewall para permitir solo tráfico interno
   - Considerar VPN si hay múltiples ubicaciones

4. **Backup**
   - Hacer backup regular de la base de datos
   - Los templates encriptados están en MongoDB
   - Guardar la clave de encriptación en lugar seguro

---

## 📞 Soporte

Para problemas o consultas:

- **Documentación DigitalPersona:** https://www.digitalpersona.com/support/
- **Issues del Proyecto:** GitHub Issues
- **Email:** soporte@empresa.com

---

## 📄 Licencia

Este sistema está protegido por las licencias correspondientes. El SDK de DigitalPersona tiene su propia licencia que debe ser respetada.

---

**Última actualización:** Enero 2024
