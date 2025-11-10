# Instalación HID DigitalPersona SDK

Esta guía explica cómo instalar y configurar el SDK oficial de HID DigitalPersona para usar el lector de huellas en el navegador.

## 📋 Requisitos

- **Lector:** DigitalPersona U.are.U 4500 (o compatible)
- **Sistema Operativo:** Windows 10 o superior
- **Navegadores:** Chrome, Firefox, Edge
- **Node.js:** v14 o superior

---

## 🔧 Paso 1: Instalar DigitalPersona WebSDK Service

### **Descargar e Instalar**

1. Ve a: https://digitalpersona.hidglobal.com/
2. Descarga el **DigitalPersona WebSDK Service** para Windows
3. Ejecuta el instalador como Administrador
4. Sigue las instrucciones del asistente

### **Verificar Instalación**

Después de instalar:
1. Conecta tu lector DigitalPersona 4500 vía USB
2. El servicio debería iniciarse automáticamente
3. Verifica en el Administrador de Dispositivos que aparece como "HID DigitalPersona"
4. Verifica que el servicio esté corriendo:
   - Abre Servicios de Windows (services.msc)
   - Busca "DigitalPersona WebSDK Service"
   - Debe estar en estado "En ejecución"

---

## 📦 Paso 2: Instalar las Librerías JavaScript

En tu proyecto, instala los paquetes npm:

```bash
cd client
npm install @digitalpersona/devices @digitalpersona/core
```

Estas librerías permiten que tu aplicación web se comunique con el DigitalPersona WebSDK Service.

---

## 🔌 Paso 3: Configurar el Proyecto en Windows

### **Clonar el Repositorio**

En la máquina Windows donde está el lector:

```bash
git clone https://github.com/smpineda129/asistencias.git
cd asistencias
```

### **Instalar Dependencias**

```bash
# Instalar dependencias del cliente
cd client
npm install

# Volver a la raíz
cd ..
```

### **Configurar Variables de Entorno**

Crea un archivo `.env.local` en la carpeta `client/`:

```env
REACT_APP_API_URL=https://sistema-asistencia-api-hjmc.onrender.com
```

Esto conectará tu frontend local con el backend desplegado en Render.

---

## ✅ Paso 4: Ejecutar la Aplicación

### **Iniciar el Frontend**

En la carpeta `client/`:

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

### **Probar el Lector Biométrico**

1. Inicia sesión en la aplicación
2. Ve a la sección de **Biometría** o **Terminal Biométrico**
3. El sistema debería detectar automáticamente el lector
4. Intenta registrar una huella
5. El lector debería encenderse y esperar tu dedo

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
