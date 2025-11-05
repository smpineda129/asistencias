const express = require('express');
const router = express.Router();
const {
  crearArea,
  obtenerAreas,
  obtenerAreaPorId,
  actualizarArea,
  eliminarArea,
  obtenerEstadisticasArea,
  obtenerInHousesArea
} = require('../controllers/area.controller');
const { protegerRuta, soloAdmin, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

/**
 * @swagger
 * /areas:
 *   post:
 *     summary: Crear nueva área
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - codigo
 *               - administrador
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Recursos Humanos
 *               descripcion:
 *                 type: string
 *                 example: Área encargada de la gestión del personal
 *               codigo:
 *                 type: string
 *                 example: RH-001
 *               administrador:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Área creada exitosamente
 *       400:
 *         description: Código de área duplicado
 */
router.post('/', soloAdmin, crearArea);

/**
 * @swagger
 * /areas:
 *   get:
 *     summary: Obtener todas las áreas
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de áreas
 */
router.get('/', verificarRol('admin', 'ceo'), obtenerAreas);

/**
 * @swagger
 * /areas/{id}:
 *   get:
 *     summary: Obtener área por ID
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Área encontrada
 *       404:
 *         description: Área no encontrada
 */
router.get('/:id', obtenerAreaPorId);

/**
 * @swagger
 * /areas/{id}:
 *   put:
 *     summary: Actualizar área
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               codigo:
 *                 type: string
 *               administrador:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Área actualizada
 */
router.put('/:id', soloAdmin, actualizarArea);

/**
 * @swagger
 * /areas/{id}:
 *   delete:
 *     summary: Eliminar área
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Área eliminada
 *       400:
 *         description: Área tiene In Houses asociados
 */
router.delete('/:id', soloAdmin, eliminarArea);

/**
 * @swagger
 * /areas/{id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del área
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas del área
 */
router.get('/:id/estadisticas', obtenerEstadisticasArea);

/**
 * @swagger
 * /areas/{id}/inhouses:
 *   get:
 *     summary: Obtener In Houses del área
 *     tags: [Áreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de In Houses
 */
router.get('/:id/inhouses', obtenerInHousesArea);

module.exports = router;
