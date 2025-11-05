const express = require('express');
const router = express.Router();
const {
  obtenerAsistencias,
  obtenerAsistenciasPorRango,
  obtenerEstadisticas,
  obtenerAsistenciasUsuario,
  obtenerResumenPorDias,
  eliminarAsistencia,
  marcarIngreso,
  marcarSalida,
  obtenerAsistenciaActiva,
  obtenerEstadoTiempoReal
} = require('../controllers/attendance.controller');
const { protegerRuta, verificarRol, soloAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Obtener todas las asistencias con filtros
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica
 *     responses:
 *       200:
 *         description: Lista de asistencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 asistencias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asistencia'
 */
router.get('/', verificarRol('admin', 'ceo'), obtenerAsistencias);

/**
 * @swagger
 * /attendance/rango:
 *   get:
 *     summary: Obtener asistencias por rango de fechas
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2024-01-01
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2024-01-31
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asistencias en el rango especificado
 */
router.get('/rango', verificarRol('admin', 'ceo'), obtenerAsistenciasPorRango);

/**
 * @swagger
 * /attendance/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de asistencias
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estadísticas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalAsistencias:
 *                       type: number
 *                     usuariosActivos:
 *                       type: number
 *                     promedioAsistenciasPorUsuario:
 *                       type: number
 */
router.get('/estadisticas', verificarRol('admin', 'ceo'), obtenerEstadisticas);

/**
 * @route   GET /api/attendance/resumen-dias
 * @desc    Obtener resumen de asistencias por días
 * @access  Private/Admin/CEO
 */
router.get('/resumen-dias', verificarRol('admin', 'ceo'), obtenerResumenPorDias);

/**
 * @route   GET /api/attendance/usuario/:usuarioId
 * @desc    Obtener asistencias de un usuario específico
 * @access  Private (usuarios pueden ver sus propias asistencias, admin/ceo pueden ver todas)
 */
router.get('/usuario/:usuarioId', obtenerAsistenciasUsuario);

/**
 * @swagger
 * /attendance/ingreso:
 *   post:
 *     summary: Marcar ingreso
 *     description: |
 *       Registra la hora de ingreso del usuario autenticado en un In House específico.
 *       
 *       **Flujo**:
 *       1. El usuario debe estar autenticado (token JWT válido)
 *       2. Selecciona el In House donde va a trabajar
 *       3. El sistema verifica que esté asignado a ese In House
 *       4. Verifica que no tenga un ingreso activo
 *       5. Se registra la hora de ingreso actual
 *       6. Se crea una asistencia con estado "activo"
 *       
 *       **Validaciones**:
 *       - Debe estar asignado al In House seleccionado
 *       - Solo puede tener un ingreso activo a la vez
 *       - Debe marcar salida antes de hacer otro ingreso
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: ID del In House donde se marca el ingreso
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inHouseId
 *             properties:
 *               inHouseId:
 *                 type: string
 *                 description: ID del In House
 *                 example: 507f1f77bcf86cd799439011
 *           example:
 *             inHouseId: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Ingreso registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ingreso registrado exitosamente
 *                 asistencia:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     usuario:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439012
 *                     fecha:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-10-24T08:30:00.000Z
 *                     horaIngreso:
 *                       type: string
 *                       example: 08:30:15
 *                     horaSalida:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     estado:
 *                       type: string
 *                       example: activo
 *       400:
 *         description: Ya tienes un ingreso activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Ya tienes un ingreso activo. Debes marcar salida primero.
 *       401:
 *         description: No autorizado - Token inválido o faltante
 */
router.post('/ingreso', marcarIngreso);

/**
 * @swagger
 * /attendance/salida/{id}:
 *   put:
 *     summary: Marcar salida
 *     description: Registra la hora de salida para una asistencia activa
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asistencia
 *     responses:
 *       200:
 *         description: Salida registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 asistencia:
 *                   $ref: '#/components/schemas/Asistencia'
 *       404:
 *         description: Asistencia no encontrada
 */
router.put('/salida/:id', marcarSalida);

/**
 * @swagger
 * /attendance/activa:
 *   get:
 *     summary: Obtener asistencia activa del usuario
 *     description: Retorna la asistencia activa (sin salida marcada) del usuario autenticado
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asistencia activa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 asistenciaActiva:
 *                   $ref: '#/components/schemas/Asistencia'
 *       404:
 *         description: No hay asistencia activa
 */
router.get('/activa', obtenerAsistenciaActiva);

/**
 * @swagger
 * /attendance/estado-tiempo-real:
 *   get:
 *     summary: Obtener estado en tiempo real de todos los usuarios
 *     description: Muestra qué usuarios están activos (con ingreso sin salida) y cuáles no
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado en tiempo real obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalUsuarios:
 *                       type: number
 *                     usuariosActivos:
 *                       type: number
 *                     usuariosInactivos:
 *                       type: number
 *                     totalIngresosHoy:
 *                       type: number
 *                     porcentajeActivos:
 *                       type: string
 *                 usuariosActivos:
 *                   type: array
 *                   items:
 *                     type: object
 *                 usuariosInactivos:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/estado-tiempo-real', verificarRol('admin', 'ceo'), obtenerEstadoTiempoReal);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Eliminar asistencia (solo admin)
 * @access  Private/Admin
 */
router.delete('/:id', soloAdmin, eliminarAsistencia);

module.exports = router;
