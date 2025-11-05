# 🚀 Instalación Rápida del Sistema Biométrico

## ✅ Checklist de Instalación

### 1. Hardware
- [ ] Lector DigitalPersona 4500 conectado vía USB
- [ ] PC/Laptop con Windows, macOS o Linux
- [ ] Conexión a internet para descarga inicial

### 2. Software - DigitalPersona SDK

#### Descargar SDK
1. Ir a: https://www.digitalpersona.com/support/
2. Descargar **U.are.U SDK** para su sistema operativo
3. Descargar **WebSDK** (para integración con navegador)

#### Instalar SDK

**Windows:**
```bash
# Ejecutar instalador
DigitalPersona_SDK_Setup.exe

# Instalar WebSDK Service
DigitalPersona_WebSDK_Setup.exe

# Verificar que el servicio esté corriendo
# Abrir Servicios (services.msc)
# Buscar: "DigitalPersona WebSDK Service"
# Estado debe ser: "En ejecución"
```

**macOS:**
```bash
# Instalar SDK
open DigitalPersona_SDK.dmg
# Arrastrar a Applications

# Instalar WebSDK
open DigitalPersona_WebSDK.dmg
sudo ./install.sh

# Verificar servicio
ps aux | grep digitalpersona
```

**Linux:**
```bash
# Instalar dependencias
sudo apt-get update
sudo apt-get install libusb-1.0-0-dev

# Instalar SDK
tar -xzf digitalpersona-sdk-linux.tar.gz
cd digitalpersona-sdk
sudo ./install.sh

# Instalar WebSDK
tar -xzf digitalpersona-websdk-linux.tar.gz
cd digitalpersona-websdk
sudo ./install.sh

# Iniciar servicio
sudo systemctl start digitalpersona-websdk
sudo systemctl enable digitalpersona-websdk
```

### 3. Configurar el Proyecto

#### Actualizar server/.env

```bash
cd server
nano .env  # o usar cualquier editor
```

Agregar:
```env
# Clave de encriptación (CAMBIAR POR UNA SEGURA)
BIOMETRIC_ENCRYPTION_KEY=mi-clave-super-secreta-de-32-caracteres-o-mas

# Otras configuraciones
PORT=5001
MONGO_URI=mongodb://localhost:27017/sistema-asistencia
```

#### Actualizar client/public/index.html

```bash
cd client/public
nano index.html  # o usar cualquier editor
```

Agregar antes de `</head>`:
```html
<!-- DigitalPersona WebSDK -->
<script src="https://localhost:8443/websdk/websdk-bundle.js"></script>
```

### 4. Aceptar Certificado SSL del WebSDK

1. Abrir navegador
2. Ir a: `https://localhost:8443`
3. Hacer clic en "Avanzado" o "Advanced"
4. Hacer clic en "Continuar a localhost (no seguro)"
5. Cerrar la pestaña

### 5. Iniciar el Sistema

```bash
# Terminal 1 - Backend
cd server
npm install  # Solo la primera vez
npm run dev

# Terminal 2 - Frontend
cd client
npm install  # Solo la primera vez
npm start
```

### 6. Verificar Instalación

1. Abrir navegador en: `http://localhost:3000`
2. Iniciar sesión como administrador
3. Ir a **Biometría** en el menú
4. Verificar que aparezca "Lector Conectado" en verde

---

## 🧪 Prueba Rápida

### Registrar Primera Huella

1. En la página de Biometría, seleccionar un usuario
2. Hacer clic en **Registrar Huella**
3. Seleccionar un dedo (ej: Índice Derecho)
4. Colocar el dedo en el lector 3 veces
5. Verificar que aparezca "Huella Registrada Exitosamente"

### Probar Terminal de Marcación

1. Abrir en nueva pestaña: `http://localhost:3000/terminal`
2. Presionar F11 para pantalla completa
3. Colocar el dedo registrado en el lector
4. Verificar que aparezca la confirmación de ingreso

---

## ❌ Solución de Problemas Comunes

### "Lector No Disponible"

**Verificar conexión USB:**
```bash
# Windows
devmgmt.msc  # Buscar en "Dispositivos de imagen"

# Linux
lsusb | grep Digital
```

**Verificar servicio WebSDK:**
```bash
# Windows
netstat -an | findstr 8443

# macOS/Linux
netstat -an | grep 8443
```

Si no aparece nada, reiniciar el servicio.

### "SDK no está cargado"

1. Verificar que `https://localhost:8443` responda
2. Aceptar el certificado SSL
3. Recargar la aplicación (Ctrl+R o Cmd+R)

### "Error al encriptar datos biométricos"

Verificar que `BIOMETRIC_ENCRYPTION_KEY` esté en `server/.env`

---

## 📱 Configuración para Terminal Dedicado

### Modo Kiosko (Pantalla Completa Automática)

**Windows - Crear acceso directo:**
```batch
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:3000/terminal
```

**Linux - Script de inicio:**
```bash
#!/bin/bash
chromium-browser --kiosk --app=http://localhost:3000/terminal &
```

**macOS - Crear app con Automator:**
1. Abrir Automator
2. Nuevo documento → Aplicación
3. Agregar acción "Ejecutar AppleScript"
4. Pegar:
```applescript
do shell script "open -a 'Google Chrome' --args --kiosk --app=http://localhost:3000/terminal"
```
5. Guardar como "Terminal Asistencia.app"

### Inicio Automático

**Windows:**
1. Presionar Win+R
2. Escribir: `shell:startup`
3. Copiar el acceso directo creado

**Linux (Ubuntu):**
```bash
# Crear archivo de inicio
nano ~/.config/autostart/terminal-asistencia.desktop

# Contenido:
[Desktop Entry]
Type=Application
Name=Terminal Asistencia
Exec=/ruta/al/script.sh
```

**macOS:**
1. Preferencias del Sistema → Usuarios y Grupos
2. Elementos de Inicio
3. Agregar "Terminal Asistencia.app"

---

## 🔐 Seguridad en Producción

### Cambiar Clave de Encriptación

```bash
# Generar clave segura (32+ caracteres)
openssl rand -base64 32

# Actualizar en server/.env
BIOMETRIC_ENCRYPTION_KEY=la-clave-generada-aqui
```

### Restringir Acceso al Terminal

En el router/firewall, configurar:
- Permitir solo IPs de la red local
- Bloquear acceso desde internet
- Usar VPN si hay múltiples ubicaciones

---

## 📞 Contacto y Soporte

**Problemas técnicos:**
- Revisar: `GUIA_BIOMETRIA.md` (documentación completa)
- GitHub Issues del proyecto

**Soporte DigitalPersona:**
- https://www.digitalpersona.com/support/
- Foros de desarrolladores

---

## ✨ ¡Listo!

El sistema biométrico está instalado y funcionando. Los usuarios pueden ahora marcar su asistencia usando sus huellas dactilares.

**Próximos pasos:**
1. Registrar huellas de todos los usuarios
2. Configurar el terminal en la entrada de la bodega
3. Capacitar al personal en el uso del sistema
4. Monitorear estadísticas en la sección de Biometría

---

**Fecha:** Enero 2024  
**Versión:** 1.0.0
