# 🚀 Configurar CI/CD con GitHub Actions

Guía completa para configurar despliegue automático a AWS cada vez que hagas push a GitHub.

---

## 📋 ¿Qué es CI/CD?

**CI/CD = Continuous Integration / Continuous Deployment**

Significa que cada vez que hagas `git push`, GitHub automáticamente:
1. ✅ Instala dependencias
2. ✅ Compila tu aplicación
3. ✅ La despliega en AWS
4. ✅ Reinicia los servicios

**Sin que tengas que hacer nada manual** 🎉

---

## 🎯 Flujo Automático

```
Tu Computadora                 GitHub                    AWS EC2
     │                           │                         │
     │  git push                 │                         │
     ├──────────────────────────>│                         │
     │                           │                         │
     │                           │ GitHub Actions          │
     │                           │ 1. Instala deps         │
     │                           │ 2. Compila React        │
     │                           │ 3. Copia a AWS ────────>│
     │                           │                         │
     │                           │                         │ Reinicia PM2
     │                           │                         │ ✅ App actualizada
     │                           │                         │
     │  ✅ Notificación          │                         │
     │<──────────────────────────┤                         │
```

---

## 🔧 Configuración Paso a Paso

### Paso 1: Preparar la Llave SSH

La llave SSH (`StaffEntry.pem`) necesita estar en GitHub como secreto.

#### 1.1 Convertir la llave al formato correcto

```bash
# Ver el contenido de tu llave
cat StaffEntry.pem

# Debería verse así:
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEA...
# ...
# -----END RSA PRIVATE KEY-----
```

#### 1.2 Copiar TODO el contenido (incluyendo BEGIN y END)

```bash
# Copiar al clipboard (Mac)
cat StaffEntry.pem | pbcopy

# O manualmente:
cat StaffEntry.pem
# Selecciona todo y copia (Cmd+C)
```

---

### Paso 2: Agregar Secretos en GitHub

1. **Ve a tu repositorio en GitHub**
   - Ejemplo: `https://github.com/tu-usuario/sistema-asistencia`

2. **Settings → Secrets and variables → Actions**

3. **Click en "New repository secret"**

4. **Crear el secreto SSH_PRIVATE_KEY:**
   - **Name**: `SSH_PRIVATE_KEY`
   - **Secret**: Pega TODO el contenido de `StaffEntry.pem`
   - Click en "Add secret"

![GitHub Secrets](https://docs.github.com/assets/cb-45016/images/help/settings/actions-secrets-new.png)

---

### Paso 3: Verificar el Archivo de Workflow

El archivo ya está creado en:
```
.github/workflows/deploy.yml
```

Verifica que la rama sea correcta:
```yaml
on:
  push:
    branches:
      - main  # Cambia a 'master' si usas esa rama
```

---

### Paso 4: Configurar el Servidor AWS (Una sola vez)

Conéctate a tu servidor y asegúrate de que PM2 esté configurado:

```bash
# Conectar al servidor
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# Instalar PM2 si no está instalado
sudo npm install -g pm2

# Configurar PM2 para inicio automático
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# Ejecuta el comando que PM2 te muestra

# Si ya tienes apps corriendo, guarda la configuración
pm2 save
```

---

### Paso 5: Hacer Push y Ver la Magia ✨

```bash
# En tu computadora
git add .
git commit -m "Configurar CI/CD con GitHub Actions"
git push origin main
```

---

## 📊 Ver el Progreso del Deployment

### En GitHub:

1. Ve a tu repositorio
2. Click en la pestaña **"Actions"**
3. Verás tu workflow corriendo en tiempo real

```
Deploy to AWS EC2
├── 📥 Checkout code          ✅
├── 🔧 Setup Node.js          ✅
├── 📦 Install dependencies   ✅
├── 🏗️ Build React app        ✅
├── 🔑 Configure SSH          ✅
├── 🚀 Deploy to EC2          ⏳ (en progreso)
└── ✅ Deployment Success     ⏳
```

### Logs en Tiempo Real:

Puedes ver exactamente qué está pasando:
- Qué archivos se están copiando
- Si hay errores
- Cuándo termina

---

## 🎯 Flujo de Trabajo Diario

### Antes (Manual):
```bash
# Hacer cambios
git add .
git commit -m "Cambios"
git push

# Conectar a AWS
ssh -i "StaffEntry.pem" ec2-user@...

# Copiar archivos
scp -r ...

# Instalar dependencias
npm install

# Reiniciar
pm2 restart all
```

### Ahora (Automático):
```bash
# Hacer cambios
git add .
git commit -m "Cambios"
git push

# ¡Listo! GitHub hace todo lo demás 🎉
```

---

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas:

1. **SSH Key en Secrets** - No está en el código
2. **Permisos 600** - La llave tiene permisos correctos
3. **Known Hosts** - Verifica la identidad del servidor
4. **Cleanup** - Elimina la llave después de usarla
5. **Backups Automáticos** - Guarda versión anterior antes de desplegar

### ⚠️ Importante:

- **NUNCA** subas `StaffEntry.pem` al repositorio
- Agrega a `.gitignore`:
  ```
  *.pem
  .env
  ```

---

## 🛠️ Personalización

### Cambiar la Rama de Deployment

Edita `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - production  # Solo desplegar desde esta rama
```

### Agregar Tests Antes de Desplegar

```yaml
- name: 🧪 Run Tests
  run: |
    cd server
    npm test
```

### Notificaciones por Email

Agrega al final del workflow:

```yaml
- name: 📧 Send Email Notification
  if: always()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deployment ${{ job.status }}
    body: El deployment a AWS ha ${{ job.status }}
    to: tu@email.com
    from: GitHub Actions
```

---

## 🐛 Troubleshooting

### Error: "Permission denied (publickey)"

**Problema**: La llave SSH no está configurada correctamente.

**Solución**:
1. Verifica que copiaste TODO el contenido de `StaffEntry.pem`
2. Incluye las líneas `-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`
3. No debe haber espacios extra al inicio o final

### Error: "Host key verification failed"

**Problema**: El servidor no está en known_hosts.

**Solución**: Ya está resuelto en el workflow con:
```yaml
ssh-keyscan -H ec2-52-90-132-79.compute-1.amazonaws.com >> ~/.ssh/known_hosts
```

### Error: "pm2: command not found"

**Problema**: PM2 no está instalado en el servidor.

**Solución**:
```bash
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com
sudo npm install -g pm2
```

### Deployment Lento

**Problema**: Tarda mucho en copiar archivos.

**Solución**: Asegúrate de que `node_modules` esté excluido:
```yaml
--exclude 'node_modules'
```

---

## 📊 Monitoreo

### Ver Estado del Último Deployment

En tu README.md, agrega un badge:

```markdown
![Deploy Status](https://github.com/tu-usuario/sistema-asistencia/actions/workflows/deploy.yml/badge.svg)
```

Se verá así:
![Deploy Status](https://img.shields.io/badge/deploy-passing-brightgreen)

### Ver Logs en AWS

```bash
# Conectar al servidor
ssh -i "StaffEntry.pem" ec2-user@ec2-52-90-132-79.compute-1.amazonaws.com

# Ver logs de PM2
pm2 logs

# Ver logs del último deployment
tail -f ~/sistema-asistencia/server/logs/app.log
```

---

## 🚀 Mejoras Futuras

### 1. Deployment por Entornos

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop

# .github/workflows/deploy-production.yml
on:
  push:
    branches:
      - main
```

### 2. Rollback Automático

Si el deployment falla, volver a la versión anterior:

```yaml
- name: 🔄 Rollback on Failure
  if: failure()
  run: |
    ssh -i ~/.ssh/id_rsa ${AWS_USER}@${AWS_HOST} << 'ENDSSH'
      # Restaurar backup más reciente
      LATEST_BACKUP=$(ls -dt ~/sistema-asistencia-backup-* | head -1)
      rm -rf ~/sistema-asistencia
      mv $LATEST_BACKUP ~/sistema-asistencia
      pm2 restart all
    ENDSSH
```

### 3. Health Check

Verificar que la app esté funcionando después del deployment:

```yaml
- name: 🏥 Health Check
  run: |
    sleep 10
    curl -f http://ec2-52-90-132-79.compute-1.amazonaws.com:5000/api/health || exit 1
```

---

## ✅ Checklist Final

Antes de hacer push, verifica:

- [ ] `StaffEntry.pem` está en `.gitignore`
- [ ] SSH_PRIVATE_KEY está en GitHub Secrets
- [ ] La rama en `deploy.yml` es correcta (main/master)
- [ ] PM2 está instalado en el servidor AWS
- [ ] El servidor tiene espacio en disco (`df -h`)
- [ ] Los puertos 3000 y 5000 están abiertos en Security Groups

---

## 🎉 ¡Listo!

Ahora cada vez que hagas:
```bash
git push
```

Tu aplicación se desplegará automáticamente en AWS. 

**Tiempo de deployment**: ~3-5 minutos

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en GitHub Actions
2. Conéctate al servidor y revisa `pm2 logs`
3. Verifica que los secretos estén configurados correctamente

---

*CI/CD configurado con GitHub Actions* 🚀
