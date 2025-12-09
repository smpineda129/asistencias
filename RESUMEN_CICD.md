# 🚀 Resumen CI/CD - GitHub Actions

## ⚡ Configuración en 3 Pasos

### 1️⃣ Agregar la Llave SSH a GitHub

```bash
# Copiar la llave
cat StaffEntry.pem | pbcopy
```

Luego en GitHub:
1. Ve a tu repo → **Settings**
2. **Secrets and variables** → **Actions**
3. **New repository secret**
   - Name: `SSH_PRIVATE_KEY`
   - Value: Pega el contenido completo de StaffEntry.pem
4. **Add secret**

---

### 2️⃣ Verificar el Workflow

El archivo ya está creado: `.github/workflows/deploy.yml`

Solo verifica que la rama sea correcta:
```yaml
on:
  push:
    branches:
      - main  # ← Cambia a 'master' si usas esa rama
```

---

### 3️⃣ Push y Listo

```bash
git add .
git commit -m "Configurar CI/CD"
git push origin main
```

---

## 🎯 ¿Qué Hace Automáticamente?

Cada vez que hagas `git push`:

```
1. 📥 Descarga tu código
2. 📦 Instala dependencias (server + client)
3. 🏗️ Compila React (npm run build)
4. 🚀 Copia todo a AWS EC2
5. 🔄 Reinicia PM2 (backend + frontend)
6. ✅ Notifica si fue exitoso o falló
```

**Tiempo total**: ~3-5 minutos

---

## 📊 Ver el Progreso

### En GitHub:
1. Ve a tu repositorio
2. Click en **"Actions"**
3. Verás el workflow corriendo en tiempo real

### En AWS:
```bash
# Conectar y ver logs
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com
pm2 logs
```

---

## 🔄 Flujo de Trabajo

### Antes (Manual):
```bash
git push
ssh -i "StaffEntry.pem" ec2-user@...
scp archivos...
npm install
pm2 restart all
```
⏱️ Tiempo: 15-20 minutos

### Ahora (Automático):
```bash
git push
```
⏱️ Tiempo: 0 minutos (GitHub lo hace por ti)

---

## ✅ Checklist de Seguridad

- [x] `.pem` está en `.gitignore`
- [x] `.env` está en `.gitignore`
- [x] SSH_PRIVATE_KEY está en GitHub Secrets
- [x] La llave se elimina después de usarse
- [x] Backups automáticos antes de desplegar

---

## 🎉 Resultado

**URLs de tu aplicación:**
- Frontend: http://ec2-52-90-132-79.compute-1.amazonaws.com:3000
- Backend: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api/health
- Swagger: http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api-docs

---

## 📖 Documentación Completa

Ver: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

---

*Deployment automático configurado* ✨
