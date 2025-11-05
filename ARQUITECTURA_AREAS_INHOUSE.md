# 🏢 Arquitectura: Áreas e In House

## 📊 Estructura Jerárquica

```
Sistema de Asistencia
│
├── Áreas (Departamentos)
│   ├── Administrador de Área
│   ├── Código único
│   └── Descripción
│       │
│       ├── In House 1 (Empresa)
│       │   ├── Encargado
│       │   ├── Correo/Login
│       │   └── Usuarios Asignados
│       │       ├── Usuario A
│       │       ├── Usuario B
│       │       └── Usuario C
│       │
│       ├── In House 2 (Empresa)
│       │   └── ...
│       │
│       └── In House N (Empresa)
│           └── ...
│
└── Usuarios
    ├── Pertenece a 1 Área
    └── Puede trabajar en varios In House
```

---

## 🎯 Roles del Sistema

### 1. **Admin** (Super Administrador)
- Acceso total al sistema
- Crea y gestiona Áreas
- Asigna Administradores de Área
- Ve todas las estadísticas globales

### 2. **CEO**
- Ve estadísticas globales
- Acceso a todos los reportes
- No puede modificar estructura

### 3. **Admin de Área** (Nuevo Rol)
- Gestiona su área específica
- Crea y gestiona In Houses de su área
- Asigna usuarios a In Houses
- Ve estadísticas de su área

### 4. **Encargado de In House** (Nuevo Rol)
- Ve tiempo real de su empresa
- Ve usuarios asignados a su In House
- Exporta reportes de su empresa
- No puede modificar asignaciones

### 5. **Usuario**
- Marca ingreso/salida
- Selecciona In House al marcar asistencia
- Ve su propio historial
- Puede trabajar en múltiples In Houses

---

## 📋 Modelos de Datos

### Área

```javascript
{
  _id: ObjectId,
  nombre: String,              // "Recursos Humanos"
  descripcion: String,         // "Área encargada de..."
  codigo: String,              // "RH-001" (único, uppercase)
  administrador: ObjectId,     // Referencia a User (rol: admin_area)
  activo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Relaciones:**
- `administrador` → Usuario con rol `admin_area`
- Tiene muchos `InHouse`
- Tiene muchos `User`

---

### In House (Empresa)

```javascript
{
  _id: ObjectId,
  nombre: String,              // "Empresa ABC S.A."
  area: ObjectId,              // Referencia a Area
  encargado: String,           // "Juan Pérez"
  correo: String,              // "juan@empresa.com" (único, login)
  password: String,            // Encriptado
  usuariosAsignados: [ObjectId], // Referencias a Users
  activo: Boolean,
  permisos: {
    verTiempoReal: Boolean,    // true
    verHistorial: Boolean,     // true
    exportarReportes: Boolean  // false
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Relaciones:**
- `area` → Área a la que pertenece
- `usuariosAsignados` → Array de usuarios que pueden trabajar aquí
- Tiene muchas `Attendance`

---

### Usuario (Actualizado)

```javascript
{
  _id: ObjectId,
  nombre: String,
  apellidos: String,
  correo: String,
  celular: String,
  area: ObjectId,              // Referencia a Area (obligatorio)
  rol: String,                 // 'admin' | 'ceo' | 'admin_area' | 'user'
  inHousesAsignados: [ObjectId], // In Houses donde puede trabajar
  password: String,
  activo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Relaciones:**
- `area` → Área a la que pertenece
- `inHousesAsignados` → Array de In Houses donde puede marcar asistencia

---

### Asistencia (Actualizada)

```javascript
{
  _id: ObjectId,
  usuario: ObjectId,           // Referencia a User
  inHouse: ObjectId,           // Referencia a InHouse (obligatorio)
  fecha: Date,
  horaIngreso: String,
  horaSalida: String,
  estado: String,              // 'activo' | 'completado'
  userAgent: String,
  ip: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Relaciones:**
- `usuario` → Usuario que marcó asistencia
- `inHouse` → In House donde se registró

---

## 🔄 Flujos de Trabajo

### Flujo 1: Crear Estructura Completa

```
1. Admin crea Área
   ├── Nombre: "Recursos Humanos"
   ├── Código: "RH-001"
   ├── Descripción: "Gestión de personal"
   └── Asigna Administrador de Área

2. Admin de Área crea In Houses
   ├── In House 1: "Empresa ABC"
   │   ├── Encargado: "Juan Pérez"
   │   └── Correo: "juan@abc.com"
   ├── In House 2: "Empresa XYZ"
   └── In House 3: "Empresa 123"

3. Admin de Área asigna usuarios a In Houses
   ├── Usuario A → [In House 1, In House 2]
   ├── Usuario B → [In House 1]
   └── Usuario C → [In House 2, In House 3]
```

### Flujo 2: Usuario Marca Asistencia

```
1. Usuario inicia sesión
   └── Sistema carga sus In Houses asignados

2. Usuario marca ingreso
   ├── Selecciona In House de la lista
   ├── Sistema valida que esté asignado
   ├── Registra hora de ingreso
   └── Asocia asistencia al In House

3. Usuario trabaja en el In House

4. Usuario marca salida
   ├── Sistema encuentra asistencia activa
   ├── Registra hora de salida
   └── Cambia estado a 'completado'

5. Usuario puede marcar ingreso en otro In House
   └── Repite proceso con diferente In House
```

### Flujo 3: Encargado de In House Consulta

```
1. Encargado inicia sesión (correo del In House)
   └── Sistema identifica su In House

2. Ve panel en tiempo real
   ├── Usuarios asignados a su In House
   ├── Quién está activo (con ingreso sin salida)
   ├── Quién no ha ingresado
   └── Estadísticas del día

3. Consulta historial
   ├── Filtra por fecha
   ├── Filtra por usuario
   └── Ve ingresos y salidas

4. Exporta reportes (si tiene permiso)
   └── Descarga CSV con asistencias
```

### Flujo 4: Admin de Área Gestiona

```
1. Admin de Área inicia sesión
   └── Ve solo su área y sus In Houses

2. Gestiona In Houses
   ├── Crear nuevo In House
   ├── Editar In House existente
   ├── Activar/Desactivar In House
   └── Cambiar permisos del encargado

3. Gestiona asignaciones
   ├── Ver usuarios del área
   ├── Asignar usuario a In House
   ├── Remover usuario de In House
   └── Ver asignaciones actuales

4. Ve estadísticas del área
   ├── Total de In Houses
   ├── Total de usuarios
   ├── Asistencias por In House
   └── Usuarios más activos
```

---

## 🔐 Permisos y Accesos

### Matriz de Permisos

| Acción | Admin | CEO | Admin Área | Encargado IH | Usuario |
|--------|-------|-----|------------|--------------|---------|
| Crear Área | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver todas las Áreas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestionar su Área | ✅ | ❌ | ✅ | ❌ | ❌ |
| Crear In House | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver In Houses | ✅ | ✅ | ✅ (su área) | ✅ (el suyo) | ✅ (asignados) |
| Asignar usuarios a IH | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver tiempo real IH | ✅ | ✅ | ✅ (su área) | ✅ (el suyo) | ❌ |
| Marcar asistencia | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver historial propio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver historial todos | ✅ | ✅ | ✅ (su área) | ✅ (su IH) | ❌ |
| Exportar reportes | ✅ | ✅ | ✅ | ⚠️ (config) | ❌ |

⚠️ = Depende de configuración de permisos

---

## 📡 Nuevos Endpoints API

### Áreas

```
POST   /api/areas                    - Crear área (Admin)
GET    /api/areas                    - Listar áreas (Admin, CEO)
GET    /api/areas/:id                - Obtener área (Admin, CEO, Admin Área)
PUT    /api/areas/:id                - Actualizar área (Admin)
DELETE /api/areas/:id                - Eliminar área (Admin)
GET    /api/areas/:id/estadisticas   - Estadísticas del área
GET    /api/areas/:id/inhouses       - In Houses del área
```

### In Houses

```
POST   /api/inhouses                 - Crear In House (Admin, Admin Área)
GET    /api/inhouses                 - Listar In Houses
GET    /api/inhouses/:id             - Obtener In House
PUT    /api/inhouses/:id             - Actualizar In House
DELETE /api/inhouses/:id             - Eliminar In House
POST   /api/inhouses/:id/usuarios    - Asignar usuario
DELETE /api/inhouses/:id/usuarios/:userId - Remover usuario
GET    /api/inhouses/:id/tiempo-real - Tiempo real del In House
GET    /api/inhouses/:id/estadisticas - Estadísticas del In House
POST   /api/inhouses/login           - Login de encargado
```

### Asistencias (Actualizadas)

```
POST   /api/attendance/ingreso       - Marcar ingreso (+ inHouseId)
PUT    /api/attendance/salida/:id    - Marcar salida
GET    /api/attendance/activa        - Asistencia activa
GET    /api/attendance/inhouse/:id   - Asistencias de un In House
```

---

## 🎨 Interfaz de Usuario

### Dashboard Admin de Área

```
┌─────────────────────────────────────────────────┐
│  📊 Área: Recursos Humanos (RH-001)            │
├─────────────────────────────────────────────────┤
│  📈 Estadísticas                                │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ 5        │ 25       │ 120      │ 85%      │ │
│  │ In Houses│ Usuarios │ Asist.   │ Activos  │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│  🏢 In Houses                                   │
│  ┌───────────────────────────────────────────┐ │
│  │ Empresa ABC        │ 8 usuarios  │ [Ver] │ │
│  │ Empresa XYZ        │ 5 usuarios  │ [Ver] │ │
│  │ Empresa 123        │ 12 usuarios │ [Ver] │ │
│  └───────────────────────────────────────────┘ │
│  [+ Nuevo In House]                             │
└─────────────────────────────────────────────────┘
```

### Dashboard Encargado de In House

```
┌─────────────────────────────────────────────────┐
│  🏢 Empresa ABC - Panel en Tiempo Real         │
├─────────────────────────────────────────────────┤
│  📊 Resumen del Día                             │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ 8        │ 6        │ 2        │ 75%      │ │
│  │ Total    │ Activos  │ Ausentes │ Asist.   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│  🟢 Usuarios Activos (6)                        │
│  ┌───────────────────────────────────────────┐ │
│  │ Juan Pérez      │ 08:30 │ Activo │ 2 ing. │ │
│  │ María García    │ 09:00 │ Activo │ 1 ing. │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  🔴 Usuarios Sin Ingresar (2)                   │
│  ┌───────────────────────────────────────────┐ │
│  │ Carlos López    │ Sin ingreso hoy         │ │
│  │ Ana Martínez    │ Sin ingreso hoy         │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Pantalla de Ingreso para Usuario

```
┌─────────────────────────────────────────────────┐
│  ⏰ Marcar Ingreso                              │
├─────────────────────────────────────────────────┤
│  Selecciona el In House:                        │
│                                                  │
│  ┌───────────────────────────────────────────┐ │
│  │ ( ) Empresa ABC                           │ │
│  │     Área: Recursos Humanos                │ │
│  │                                           │ │
│  │ ( ) Empresa XYZ                           │ │
│  │     Área: Recursos Humanos                │ │
│  │                                           │ │
│  │ ( ) Empresa 123                           │ │
│  │     Área: Operaciones                     │ │
│  └───────────────────────────────────────────┘ │
│                                                  │
│  [Marcar Ingreso]                               │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Migración de Datos Existentes

### Script de Migración

```javascript
// migration-areas-inhouses.js

const mongoose = require('mongoose');
const Area = require('./models/Area');
const InHouse = require('./models/InHouse');
const User = require('./models/User.model');

async function migrarDatos() {
  // 1. Crear áreas basadas en las áreas actuales de usuarios
  const areasUnicas = await User.distinct('area');
  
  const areasCreadas = {};
  for (const areaNombre of areasUnicas) {
    const area = await Area.create({
      nombre: areaNombre,
      descripcion: `Área de ${areaNombre}`,
      codigo: areaNombre.substring(0, 3).toUpperCase() + '-001',
      administrador: adminId // ID del admin principal
    });
    areasCreadas[areaNombre] = area._id;
  }
  
  // 2. Crear un In House por defecto para cada área
  const inHousesCreados = {};
  for (const [areaNombre, areaId] of Object.entries(areasCreadas)) {
    const inHouse = await InHouse.create({
      nombre: `In House Principal - ${areaNombre}`,
      area: areaId,
      encargado: 'Administrador',
      correo: `inhouse.${areaNombre.toLowerCase()}@empresa.com`,
      password: 'temporal123' // Cambiar después
    });
    inHousesCreados[areaNombre] = inHouse._id;
  }
  
  // 3. Actualizar usuarios
  for (const [areaNombre, areaId] of Object.entries(areasCreadas)) {
    const inHouseId = inHousesCreados[areaNombre];
    
    await User.updateMany(
      { area: areaNombre },
      { 
        $set: { 
          area: areaId,
          inHousesAsignados: [inHouseId]
        }
      }
    );
    
    // Actualizar usuarios asignados en el In House
    const usuarios = await User.find({ area: areaId }).select('_id');
    await InHouse.findByIdAndUpdate(inHouseId, {
      usuariosAsignados: usuarios.map(u => u._id)
    });
  }
  
  console.log('✅ Migración completada');
}
```

---

## 📊 Consultas Útiles

### Obtener usuarios de un In House que están activos

```javascript
const usuariosActivos = await Attendance.find({
  inHouse: inHouseId,
  fecha: { $gte: hoyInicio },
  estado: 'activo'
}).populate('usuario', 'nombre apellidos');
```

### Estadísticas de un área

```javascript
const estadisticas = await Area.aggregate([
  { $match: { _id: areaId } },
  {
    $lookup: {
      from: 'inhouses',
      localField: '_id',
      foreignField: 'area',
      as: 'inhouses'
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: 'area',
      as: 'usuarios'
    }
  },
  {
    $project: {
      nombre: 1,
      totalInHouses: { $size: '$inhouses' },
      totalUsuarios: { $size: '$usuarios' }
    }
  }
]);
```

### Asistencias por In House en un rango

```javascript
const asistencias = await Attendance.find({
  inHouse: inHouseId,
  fecha: { $gte: fechaInicio, $lte: fechaFin }
})
.populate('usuario', 'nombre apellidos')
.populate('inHouse', 'nombre')
.sort({ fecha: -1 });
```

---

## 🚀 Implementación por Fases

### Fase 1: Modelos y Migraciones (1 semana)
- ✅ Crear modelos Area, InHouse
- ✅ Actualizar modelos User, Attendance
- ✅ Script de migración de datos
- ✅ Testing de modelos

### Fase 2: API Backend (2 semanas)
- Controladores de Áreas
- Controladores de In Houses
- Actualizar controladores de Asistencias
- Middleware de permisos por rol
- Testing de endpoints

### Fase 3: Frontend Admin (2 semanas)
- Dashboard de Áreas
- CRUD de In Houses
- Asignación de usuarios
- Gestión de permisos

### Fase 4: Frontend Usuario (1 semana)
- Selector de In House al marcar ingreso
- Historial por In House
- Perfil con In Houses asignados

### Fase 5: Frontend Encargado (1 semana)
- Login de encargados
- Panel en tiempo real
- Reportes del In House

### Fase 6: Testing y Ajustes (1 semana)
- Testing integral
- Ajustes de UX
- Documentación
- Capacitación

**Total: 8 semanas**

---

## 📞 Soporte

Para dudas sobre la implementación:
- Email: arquitectura@empresa.com
- Documentación: Ver archivos MD del proyecto
