# 📋 Próximos Pasos - Sistema de Asistencia

Este documento describe los pasos necesarios para llevar el sistema a producción y configuraciones adicionales.

---

## 1. 📧 Configuración de SMTP para Envío de Correos

### Gmail (Recomendado para desarrollo)

1. **Habilitar autenticación de dos factores en Gmail**
   - Ve a tu cuenta de Google → Seguridad
   - Activa la verificación en dos pasos

2. **Generar contraseña de aplicación**
   - En Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro dispositivo"
   - Copia la contraseña generada (16 caracteres)

3. **Configurar variables de entorno**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=tu_correo@gmail.com
   SMTP_PASS=tu_contraseña_de_aplicacion_16_caracteres
   ```

### SendGrid (Recomendado para producción)

1. **Crear cuenta en SendGrid**
   - Visita: https://sendgrid.com
   - Plan gratuito: 100 correos/día

2. **Generar API Key**
   - Settings → API Keys → Create API Key
   - Permisos: Full Access

3. **Configurar variables de entorno**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=tu_api_key_de_sendgrid
   ```

### AWS SES (Para alto volumen)

1. **Configurar AWS SES**
   - Consola AWS → Simple Email Service
   - Verificar dominio o correo

2. **Obtener credenciales SMTP**
   - SMTP Settings → Create SMTP Credentials

3. **Configurar variables de entorno**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=tu_smtp_username
   SMTP_PASS=tu_smtp_password
   ```

---

## 2. 🗄️ MongoDB en AWS

### Opción A: MongoDB Atlas (Recomendado)

1. **Crear cuenta en MongoDB Atlas**
   - Visita: https://www.mongodb.com/cloud/atlas
   - Plan gratuito: 512MB

2. **Crear cluster**
   - Selecciona región más cercana (ej: us-east-1)
   - Tier: M0 (Free)

3. **Configurar acceso**
   - Database Access → Add New Database User
   - Network Access → Add IP Address (0.0.0.0/0 para desarrollo)

4. **Obtener connection string**
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/sistema-asistencia
   ```

5. **Actualizar .env**
   ```env
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sistema-asistencia?retryWrites=true&w=majority
   ```

### Opción B: MongoDB en EC2

1. **Lanzar instancia EC2**
   - Ubuntu Server 22.04 LTS
   - Tipo: t2.micro (capa gratuita)

2. **Instalar MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Configurar seguridad**
   ```bash
   sudo nano /etc/mongod.conf
   # Cambiar bindIp: 0.0.0.0
   # Habilitar autenticación
   ```

4. **Crear usuario administrador**
   ```javascript
   use admin
   db.createUser({
     user: "admin",
     pwd: "password_seguro",
     roles: ["root"]
   })
   ```

---

## 3. 🚀 Despliegue de la Aplicación

### Backend (Node.js)

#### Opción A: AWS EC2

1. **Lanzar instancia EC2**
   - Ubuntu Server 22.04 LTS
   - Tipo: t2.small o superior
   - Security Group: Puertos 22, 80, 443, 5001

2. **Conectar y configurar**
   ```bash
   ssh -i tu-key.pem ubuntu@tu-ip-publica
   
   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instalar PM2
   sudo npm install -g pm2
   
   # Clonar repositorio
   git clone tu-repositorio.git
   cd sistema-asistencia/server
   npm install
   
   # Configurar .env
   nano .env
   
   # Iniciar con PM2
   pm2 start index.js --name "asistencia-api"
   pm2 startup
   pm2 save
   ```

3. **Configurar Nginx como proxy reverso**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/asistencia
   ```
   
   ```nginx
   server {
       listen 80;
       server_name api.tudominio.com;
       
       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Habilitar SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.tudominio.com
   ```

#### Opción B: Heroku

1. **Instalar Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Crear aplicación**
   ```bash
   cd server
   heroku create asistencia-api
   ```

3. **Configurar variables de entorno**
   ```bash
   heroku config:set MONGO_URI=tu_mongo_uri
   heroku config:set JWT_SECRET=tu_jwt_secret
   heroku config:set NODE_ENV=production
   ```

4. **Desplegar**
   ```bash
   git push heroku main
   ```

### Frontend (React)

#### Opción A: Vercel (Recomendado)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Desplegar**
   ```bash
   cd client
   vercel
   ```

3. **Configurar variables de entorno en Vercel**
   - Dashboard → Settings → Environment Variables
   - `REACT_APP_API_URL=https://api.tudominio.com/api`

#### Opción B: AWS S3 + CloudFront

1. **Build de producción**
   ```bash
   cd client
   npm run build
   ```

2. **Crear bucket S3**
   - Nombre: asistencia-frontend
   - Habilitar hosting estático
   - Política de bucket pública

3. **Subir archivos**
   ```bash
   aws s3 sync build/ s3://asistencia-frontend
   ```

4. **Configurar CloudFront**
   - Crear distribución
   - Origin: bucket S3
   - SSL certificate: ACM

---

## 4. 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar `JWT_SECRET` a un valor aleatorio fuerte
- [ ] Configurar CORS solo para dominios específicos
- [ ] Habilitar rate limiting
- [ ] Implementar helmet.js para headers de seguridad
- [ ] Configurar HTTPS/SSL
- [ ] Habilitar autenticación en MongoDB
- [ ] Configurar firewall (UFW en Linux)
- [ ] Implementar logs de auditoría
- [ ] Backup automático de base de datos
- [ ] Monitoreo con CloudWatch o similar

### Implementar Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});

app.use('/api/', limiter);
```

---

## 5. 📊 Monitoreo y Logs

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### AWS CloudWatch

1. Instalar agente CloudWatch
2. Configurar métricas personalizadas
3. Crear alarmas para:
   - CPU > 80%
   - Memoria > 80%
   - Errores 5xx
   - Tiempo de respuesta > 2s

---

## 6. 🔄 CI/CD (Opcional)

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_KEY }}
          script: |
            cd sistema-asistencia
            git pull
            cd server && npm install
            pm2 restart asistencia-api
```

---

## 7. 📱 Aplicación Móvil (Futuro)

### React Native

- Reutilizar lógica de API
- Implementar notificaciones push
- Geolocalización para validar ubicación
- Modo offline con sincronización

---

## 8. 🧪 Testing

### Backend

```bash
npm install --save-dev jest supertest
```

### Frontend

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

---

## 📞 Soporte

Para cualquier duda o problema durante el despliegue:
- Email: soporte@empresa.com
- Documentación: https://docs.asistencia.empresa.com
