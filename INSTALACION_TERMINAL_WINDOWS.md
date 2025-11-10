# 🖥️ Instalación del Terminal Biométrico en Windows

Esta guía te ayudará a configurar el terminal de asistencias con lector biométrico en el PC de la bodega/entrada.

---

## 📋 Requisitos Previos

- ✅ Windows 10 o superior
- ✅ Lector DigitalPersona U.are.U 4500 conectado vía USB
- ✅ Conexión a Internet
- ✅ Node.js instalado (v14 o superior)
- ✅ Git instalado

---

## 🔧 Paso 1: Instalar Software Necesario

### **1.1 Instalar Node.js**

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador
4. Acepta todas las opciones por defecto
5. Verifica la instalación:
   ```cmd
   node --version
   npm --version
   ```

### **1.2 Instalar Git**

1. Ve a: https://git-scm.com/download/win
2. Descarga el instalador
3. Ejecuta el instalador
4. Acepta todas las opciones por defecto
5. Verifica la instalación:
   ```cmd
   git --version
   ```

### **1.3 Instalar DigitalPersona WebSDK Service**

1. Ve a: https://digitalpersona.hidglobal.com/
2. Descarga el **DigitalPersona WebSDK Service** para Windows
3. Ejecuta el instalador **como Administrador**
4. Sigue las instrucciones del asistente
5. Conecta el lector USB
6. Verifica que el servicio esté corriendo:
   - Presiona `Win + R`
   - Escribe `services.msc` y presiona Enter
   - Busca "DigitalPersona WebSDK Service"
   - Debe estar en estado "En ejecución"

---

## 📥 Paso 2: Clonar el Repositorio

1. **Abre la terminal de comandos (CMD o PowerShell)**
   - Presiona `Win + R`
   - Escribe `cmd` y presiona Enter

2. **Navega a donde quieres instalar** (ejemplo: Disco C):
   ```cmd
   cd C:\
   ```

3. **Clona el repositorio:**
   ```cmd
   git clone https://github.com/smpineda129/asistencias.git
   ```

4. **Entra a la carpeta del cliente:**
   ```cmd
   cd asistencias\client
   ```

---

## 📦 Paso 3: Instalar Dependencias

### **3.1 Instalar dependencias normales:**

```cmd
npm install
```

Espera a que termine (puede tomar 2-5 minutos).

### **3.2 Instalar librerías de DigitalPersona:**

```cmd
npm install @digitalpersona/devices @digitalpersona/core --no-save
```

⚠️ **IMPORTANTE:** El flag `--no-save` es necesario para que no se agreguen al package.json.

---

## ⚙️ Paso 4: Configurar la Aplicación

### **4.1 Crear archivo de configuración:**

1. **Dentro de la carpeta `client/`**, crea un archivo llamado `.env.local`

2. **Abre el archivo con el Bloc de notas** y agrega esta línea:
   ```
   REACT_APP_API_URL=https://sistema-asistencia-api-hjmc.onrender.com
   ```

3. **Guarda y cierra** el archivo

**Alternativa (PowerShell):**
```powershell
echo "REACT_APP_API_URL=https://sistema-asistencia-api-hjmc.onrender.com" > .env.local
```

---

## 🚀 Paso 5: Ejecutar la Aplicación

### **5.1 Iniciar el servidor:**

```cmd
npm start
```

### **5.2 Esperar a que se abra el navegador:**

- Se abrirá automáticamente en `http://localhost:3000`
- Si no se abre, abre Chrome y ve a: `http://localhost:3000`

### **5.3 Iniciar sesión:**

- Usa las credenciales de administrador que creaste
- O crea un usuario específico para el terminal

---

## 🎯 Paso 6: Configurar el Terminal

### **6.1 Ir a la página del terminal:**

En el navegador, ve a: `http://localhost:3000/terminal`

### **6.2 Verificar el lector:**

- Debería aparecer el estado del lector
- Si dice "Lector disponible" ✅ todo está bien
- Si dice "Lector no conectado" ❌ revisa la conexión USB

### **6.3 Probar el registro:**

1. Coloca un dedo en el lector
2. Debería capturar la huella
3. Buscar al usuario
4. Registrar entrada/salida

---

## 🔄 Paso 7: Configurar Inicio Automático (Opcional)

### **Opción A: Script de inicio rápido**

1. **Crea un archivo** `iniciar-terminal.bat` en el escritorio
2. **Abre con Bloc de notas** y pega:

```batch
@echo off
title Terminal de Asistencia
cd C:\asistencias\client

echo ========================================
echo   TERMINAL DE ASISTENCIA BIOMETRICA
echo ========================================
echo.
echo Iniciando servidor...
start /min cmd /c npm start

echo Esperando que el servidor inicie...
timeout /t 15 /nobreak > nul

echo Abriendo terminal en el navegador...
start chrome.exe --app=http://localhost:3000/terminal --start-fullscreen

echo.
echo Terminal iniciado correctamente!
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
exit
```

3. **Guarda el archivo**
4. **Doble clic** para ejecutar

### **Opción B: Inicio automático con Windows**

1. Presiona `Win + R`
2. Escribe `shell:startup` y presiona Enter
3. Copia el archivo `iniciar-terminal.bat` a esa carpeta
4. El terminal se iniciará automáticamente al encender el PC

---

## 🔧 Mantenimiento y Actualización

### **Actualizar el código:**

```cmd
cd C:\asistencias
git pull origin main
cd client
npm install
```

### **Reiniciar el servicio:**

Si el terminal se congela o hay problemas:

1. Cierra el navegador
2. Cierra la terminal (CMD)
3. Ejecuta nuevamente `iniciar-terminal.bat`

---

## 🐛 Solución de Problemas

### **Error: "SDK no disponible"**

**Causa:** Las librerías de DigitalPersona no están instaladas.

**Solución:**
```cmd
cd C:\asistencias\client
npm install @digitalpersona/devices @digitalpersona/core --no-save
```

---

### **Error: "Lector no conectado"**

**Causa:** El lector no está conectado o el servicio no está corriendo.

**Solución:**
1. Verifica que el lector esté conectado al USB
2. Abre `services.msc`
3. Busca "DigitalPersona WebSDK Service"
4. Click derecho → Reiniciar

---

### **Error: "Cannot connect to backend"**

**Causa:** No hay conexión a internet o el archivo `.env.local` no existe.

**Solución:**
1. Verifica la conexión a internet
2. Verifica que existe el archivo `client/.env.local`
3. Verifica que contiene: `REACT_APP_API_URL=https://sistema-asistencia-api-hjmc.onrender.com`

---

### **Error: "npm: command not found"**

**Causa:** Node.js no está instalado o no está en el PATH.

**Solución:**
1. Reinstala Node.js desde https://nodejs.org/
2. Reinicia la terminal (CMD)
3. Verifica: `node --version`

---

### **El navegador no se abre automáticamente**

**Solución:**
1. Abre Chrome manualmente
2. Ve a: `http://localhost:3000/terminal`
3. Agrega a favoritos para acceso rápido

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la terminal (CMD)
2. Abre la consola del navegador (F12)
3. Busca mensajes de error
4. Contacta al administrador del sistema

---

## ✅ Checklist de Verificación

Antes de dejar el terminal en producción, verifica:

- [ ] Node.js instalado y funcionando
- [ ] Git instalado
- [ ] DigitalPersona WebSDK Service corriendo
- [ ] Lector conectado y detectado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Archivo `.env.local` creado
- [ ] App inicia correctamente (`npm start`)
- [ ] Navegador abre en `localhost:3000`
- [ ] Lector detectado en la app
- [ ] Prueba de captura de huella exitosa
- [ ] Script de inicio automático creado (opcional)

---

## 🎯 Uso Diario

### **Para el usuario del terminal:**

1. **Encender el PC**
2. **Doble clic en `iniciar-terminal.bat`** (si no es automático)
3. **Esperar 15 segundos** a que se abra el navegador
4. **Listo para usar**

### **Para registrar asistencia:**

1. **Empleado coloca el dedo** en el lector
2. **Sistema captura la huella**
3. **Busca al usuario automáticamente**
4. **Registra entrada o salida**
5. **Muestra confirmación**

---

## 📊 Monitoreo

Los administradores pueden ver los registros en tiempo real desde:

**https://tu-app.vercel.app**

- Dashboard con estadísticas
- Reportes de asistencias
- Gestión de usuarios
- Configuración del sistema

---

**¡Terminal listo para usar! 🎉**
