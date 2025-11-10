# Configuración del Lector Biométrico

## ⚠️ IMPORTANTE

Las librerías de DigitalPersona (`@digitalpersona/devices` y `@digitalpersona/core`) **NO están incluidas** en `package.json` porque causan errores en el build de producción de Vercel.

## 🔧 Setup en Windows (Máquina con el Lector)

### 1. Instalar Dependencias Normales

```bash
npm install
```

### 2. Instalar Librerías de DigitalPersona

```bash
npm install @digitalpersona/devices @digitalpersona/core --no-save
```

El flag `--no-save` evita que se agreguen al `package.json`.

### 3. Verificar Instalación

Las librerías deben estar en `node_modules/` pero NO en `package.json`.

```bash
# Verificar que existen
ls node_modules/@digitalpersona/

# Deberías ver:
# core/
# devices/
```

## 🚀 Ejecutar la Aplicación

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000` y podrá acceder al lector biométrico.

## 📝 Notas

- **Producción (Vercel):** La app funciona sin las librerías biométricas
- **Local (Windows):** Las librerías se instalan manualmente para usar el lector
- **Git:** Las librerías NO se suben al repositorio (están en `.gitignore`)

## 🐛 Solución de Problemas

### Error: "SDK no disponible"

**Causa:** Las librerías no están instaladas.

**Solución:**
```bash
npm install @digitalpersona/devices @digitalpersona/core --no-save
```

### Error: "Module not found: WebSdk"

**Causa:** Las librerías se agregaron al `package.json`.

**Solución:**
1. Elimina las líneas de `@digitalpersona` del `package.json`
2. Ejecuta `npm install`
3. Instala las librerías con `--no-save`
