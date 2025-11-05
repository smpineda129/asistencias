const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Asistencia API',
      version: '1.0.0',
      description: 'API REST para el Sistema de Control de Asistencia del Personal',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'soporte@empresa.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.asistencia.empresa.com/api',
        description: 'Servidor de Producción'
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y gestión de sesiones'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios (CRUD - Solo Admin)'
      },
      {
        name: 'Asistencias',
        description: 'Registro y consulta de asistencias (ingreso/salida)'
      },
      {
        name: 'Áreas',
        description: 'Gestión de áreas/departamentos (Solo Admin)'
      },
      {
        name: 'In Houses',
        description: 'Gestión de empresas In House y asignación de usuarios'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            apellidos: {
              type: 'string',
              description: 'Apellidos del usuario'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico'
            },
            celular: {
              type: 'string',
              description: 'Número de celular'
            },
            area: {
              type: 'string',
              description: 'Área de trabajo'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'ceo', 'user'],
              description: 'Rol del usuario'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del usuario'
            }
          }
        },
        Asistencia: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la asistencia'
            },
            usuario: {
              type: 'string',
              description: 'ID del usuario'
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la asistencia'
            },
            horaIngreso: {
              type: 'string',
              description: 'Hora de ingreso'
            },
            horaSalida: {
              type: 'string',
              description: 'Hora de salida (null si está activo)'
            },
            estado: {
              type: 'string',
              enum: ['activo', 'completado'],
              description: 'Estado de la asistencia'
            },
            userAgent: {
              type: 'string',
              description: 'User agent del navegador'
            },
            ip: {
              type: 'string',
              description: 'Dirección IP'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
