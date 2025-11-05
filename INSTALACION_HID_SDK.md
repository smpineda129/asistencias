# Instalación HID DigitalPersona SDK

Esta guía explica cómo instalar y configurar el SDK oficial de HID DigitalPersona para usar el lector de huellas en el navegador.

## 📋 Requisitos

- **Lector:** DigitalPersona U.are.U 4500 (o compatible)
- **Sistema Operativo:** Windows 10 o superior
- **Navegadores:** Chrome, Firefox, Edge

---

## 🔧 Paso 1: Instalar HID Authentication Device Client (ADC)

### **Descargar el Cliente**

1. Ve a: https://www.hidglobal.com/
2. Busca "Authentication Device Client" o "ADC"
3. Descarga la versión para Windows
4. Ejecuta el instalador

### **Verificar Instalación**

Después de instalar:
1. Conecta tu lector DigitalPersona 4500 vía USB
2. El cliente ADC debería detectarlo automáticamente
3. Verifica en el Administrador de Dispositivos que aparece como "HID DigitalPersona"

---

## 📦 Paso 2: Instalar la Librería JavaScript

En tu proyecto, instala el paquete npm:

```bash
cd client
npm install @digitalpersona/fingerprint
```

Si el paquete no está disponible en npm, descarga los archivos desde:
https://github.com/hidglobal/digitalpersona-access-management-services

Y copia estos archivos a `client/public/`:
```
fingerprint.sdk.js
fingerprint.sdk.d.ts
```

---

## 🔌 Paso 3: Configurar el Proyecto

### **Opción A: Usando npm (Recomendado)**

Si instalaste vía npm, importa en tu servicio:

```javascript
import { FingerprintReader } from '@digitalpersona/fingerprint';
```

### **Opción B: Usando archivos locales**

Si descargaste los archivos manualmente:

1. Copia `fingerprint.sdk.js` a `client/public/`
2. Agrega el script en `client/public/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sistema de Asistencia</title>
    
    <!-- HID DigitalPersona SDK -->
    <script src="%PUBLIC_URL%/fingerprint.sdk.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

## ✅ Paso 4: Probar la Instalación

### **Verificar que el Cliente ADC está corriendo**

1. Abre el Administrador de Tareas (Ctrl + Shift + Esc)
2. Busca procesos relacionados con "DigitalPersona" o "HID"
3. Debería haber un servicio corriendo

### **Probar en tu Aplicación**

1. Inicia tu aplicación React:
```bash
npm start
```

2. Ve a la página de Biometría
3. Intenta registrar una huella
4. Si todo está bien, debería detectar el lector

---

## 🐛 Solución de Problemas

### **Error: "SDK no cargado"**

**Causa:** El cliente ADC no está instalado o no está corriendo.

**Solución:**
1. Verifica que instalaste el HID Authentication Device Client
2. Reinicia el servicio desde Servicios de Windows
3. Reinicia tu PC

### **Error: "Lector no conectado"**

**Causa:** El lector no está conectado o no tiene drivers.

**Solución:**
1. Verifica la conexión USB
2. Prueba otro puerto USB
3. Reinstala los drivers del lector
4. Verifica en Administrador de Dispositivos

### **Error: "No se pudo capturar la huella"**

**Causa:** Calidad de la huella baja o lector sucio.

**Solución:**
1. Limpia el sensor con un paño suave
2. Asegúrate de presionar el dedo firmemente
3. Intenta con otro dedo
4. Ajusta el threshold de calidad en el código

---

## 📚 Documentación Adicional

- **Repositorio oficial:** https://github.com/hidglobal/digitalpersona-access-management-services
- **Documentación API:** https://hidglobal.github.io/digitalpersona-access-management-services/
- **Soporte HID:** https://www.hidglobal.com/support

---

## 🎯 Próximos Pasos

Una vez que la instalación esté completa:

1. ✅ Prueba registrar huellas en tu aplicación
2. ✅ Verifica que la verificación funcione
3. ✅ Ajusta los thresholds de calidad si es necesario
4. ✅ Implementa el terminal de registro biométrico

---

## 💡 Notas Importantes

- El SDK solo funciona en **navegadores**, no en NodeJS
- Requiere **HTTPS** en producción (localhost funciona con HTTP)
- El cliente ADC debe estar **siempre corriendo** en segundo plano
- Solo funciona en la **PC donde está conectado el lector**

---

## 🔐 Seguridad

- Las huellas se almacenan como **templates encriptados**, no como imágenes
- Los templates son **irreversibles** (no se puede recrear la huella original)
- Usa **HTTPS** en producción para proteger la transmisión de datos
- Implementa **rate limiting** para prevenir ataques de fuerza bruta
