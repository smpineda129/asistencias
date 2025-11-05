# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Control de Asistencia! Este documento te guiará en el proceso.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Estándares de Código](#estándares-de-código)
5. [Commit Messages](#commit-messages)
6. [Pull Requests](#pull-requests)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

### Nuestros Estándares

- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Respetar diferentes puntos de vista
- ✅ Aceptar críticas constructivas
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

---

## ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no haya sido reportado antes
2. **Crea un issue** con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Versión de Node.js, navegador, OS

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. **Crea un issue** con:
   - Descripción clara de la funcionalidad
   - Casos de uso
   - Mockups o ejemplos si es posible
   - Beneficios esperados

### Contribuir con Código

1. **Fork** el repositorio
2. **Crea una rama** para tu feature
3. **Desarrolla** tu funcionalidad
4. **Escribe tests** si es aplicable
5. **Documenta** tus cambios
6. **Envía un Pull Request**

---

## Proceso de Desarrollo

### Setup Inicial

```bash
# Fork y clonar
git clone https://github.com/tu-usuario/sistema-asistencia.git
cd sistema-asistencia

# Instalar dependencias
npm run install-all

# Configurar .env
cp .env.example .env
# Edita .env con tus configuraciones

# Crear rama para tu feature
git checkout -b feature/mi-nueva-funcionalidad
```

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# El servidor se recarga automáticamente con nodemon
# React se recarga automáticamente con hot reload
```

### Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Verificar linting
npm run lint
```

---

## Estándares de Código

### JavaScript/React

- **Usar ES6+** (arrow functions, destructuring, etc.)
- **Componentes funcionales** con hooks
- **Nombres descriptivos** para variables y funciones
- **Comentarios** para lógica compleja
- **Evitar código duplicado**

### Ejemplo de Componente

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para mostrar el perfil del usuario
 */
const UserProfile = () => {
  const { usuario } = useAuth();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Cargar datos del usuario
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Lógica de carga
      setCargando(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (cargando) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="card">
      <h2>{usuario.nombreCompleto}</h2>
      <p>{usuario.correo}</p>
    </div>
  );
};

export default UserProfile;
```

### Backend

- **Estructura MVC** (Model-View-Controller)
- **Async/await** para operaciones asíncronas
- **Try/catch** para manejo de errores
- **Validación** de datos en controladores
- **Comentarios JSDoc** en funciones importantes

### Ejemplo de Controlador

```javascript
/**
 * Obtener todos los usuarios
 * GET /api/users
 * @access Private/Admin
 */
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol, activo } = req.query;
    
    // Construir filtro
    const filtro = {};
    if (rol) filtro.rol = rol;
    if (activo !== undefined) filtro.activo = activo === 'true';
    
    const usuarios = await User.find(filtro)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      total: usuarios.length,
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};
```

### CSS/TailwindCSS

- **Usar clases de Tailwind** cuando sea posible
- **Clases personalizadas** en index.css para componentes reutilizables
- **Responsive design** (mobile-first)
- **Colores del tema** (primary, secondary, accent)

---

## Commit Messages

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

### Ejemplos

```bash
feat(auth): agregar autenticación con Google

fix(dashboard): corregir error en gráfica de asistencias

docs(readme): actualizar guía de instalación

style(login): mejorar diseño de formulario

refactor(api): simplificar controladores de usuario

perf(dashboard): optimizar consultas a base de datos

test(auth): agregar tests para login

chore(deps): actualizar dependencias
```

---

## Pull Requests

### Antes de Enviar

- ✅ Tu código sigue los estándares del proyecto
- ✅ Has agregado tests si es necesario
- ✅ Has actualizado la documentación
- ✅ Todos los tests pasan
- ✅ Tu código no tiene conflictos con main

### Proceso

1. **Actualiza tu fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push a tu fork**
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```

3. **Crea el Pull Request**
   - Título descriptivo
   - Descripción detallada de cambios
   - Screenshots si aplica
   - Referencias a issues relacionados

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests
- [ ] Los tests pasan localmente

## Screenshots (si aplica)
Agrega screenshots de los cambios visuales
```

---

## Estructura de Ramas

- **main**: Rama principal (producción)
- **develop**: Rama de desarrollo
- **feature/**: Nuevas funcionalidades
- **fix/**: Correcciones de bugs
- **docs/**: Cambios en documentación
- **refactor/**: Refactorización

### Ejemplo

```bash
# Nueva funcionalidad
git checkout -b feature/registro-salida

# Corrección de bug
git checkout -b fix/error-login

# Documentación
git checkout -b docs/guia-despliegue
```

---

## Preguntas Frecuentes

### ¿Puedo trabajar en un issue existente?

Sí, comenta en el issue indicando que trabajarás en él.

### ¿Cuánto tiempo toma revisar un PR?

Generalmente 2-5 días hábiles.

### ¿Qué hago si mi PR tiene conflictos?

Actualiza tu rama con main y resuelve los conflictos:
```bash
git fetch upstream
git rebase upstream/main
# Resolver conflictos
git push -f origin tu-rama
```

### ¿Puedo contribuir sin saber programar?

¡Sí! Puedes ayudar con:
- Documentación
- Reportar bugs
- Sugerir mejoras
- Traducir a otros idiomas
- Diseño UI/UX

---

## Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de MongoDB](https://www.mongodb.com/docs/)
- [TailwindCSS](https://tailwindcss.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Contacto

Si tienes preguntas, puedes:
- Abrir un issue
- Comentar en un PR existente
- Revisar la documentación

---

**¡Gracias por contribuir!** 🎉
