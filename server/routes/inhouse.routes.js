const express = require('express');
const router = express.Router();
const {
  crearInHouse,
  loginInHouse,
  obtenerInHouses,
  obtenerInHousePorId,
  actualizarInHouse,
  asignarUsuario,
  removerUsuario,
  obtenerTiempoReal,
  obtenerEstadisticas
} = require('../controllers/inhouse.controller');
const { protegerRuta, soloAdmin, verificarRol } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /inhouses/login:
 *   post:
 *     summary: Login de encargado de In House
 *     tags: [In Houses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: encargado@empresa.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 inHouse:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginInHouse);

// Rutas protegidas
router.use(protegerRuta);

/**
 * @swagger
 * /inhouses:
 *   post:
 *     summary: Crear nuevo In House
 *     tags: [In Houses]
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
 *               - area
 *               - encargado
 *               - correo
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Empresa ABC S.A.
 *               area:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               encargado:
 *                 type: string
 *                 example: Juan Pérez
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan@empresaabc.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               permisos:
 *                 type: object
 *                 properties:
 *                   verTiempoReal:
 *                     type: boolean
 *                   verHistorial:
 *                     type: boolean
 *                   exportarReportes:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: In House creado exitosamente
 *       400:
 *         description: Correo duplicado
 */
router.post('/', verificarRol('admin', 'admin_area'), crearInHouse);

/**
 * @swagger
 * /inhouses:
 *   get:
 *     summary: Obtener todos los In Houses
 *     tags: [In Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filtrar por área
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de In Houses
 */
router.get('/', obtenerInHouses);

/**
 * @swagger
 * /inhouses/{id}:
 *   get:
 *     summary: Obtener In House por ID
 *     tags: [In Houses]
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
 *         description: In House encontrado
 *       404:
 *         description: In House no encontrado
 */
router.get('/:id', obtenerInHousePorId);

/**
 * @swagger
 * /inhouses/{id}:
 *   put:
 *     summary: Actualizar In House
 *     tags: [In Houses]
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
 *               encargado:
 *                 type: string
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *               permisos:
 *                 type: object
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: In House actualizado
 */
router.put('/:id', verificarRol('admin', 'admin_area'), actualizarInHouse);

/**
 * @swagger
 * /inhouses/{id}/usuarios:
 *   post:
 *     summary: Asignar usuario a In House
 *     tags: [In Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Usuario asignado exitosamente
 *       400:
 *         description: Usuario no pertenece al área
 */
router.post('/:id/usuarios', verificarRol('admin', 'admin_area'), asignarUsuario);

/**
 * @swagger
 * /inhouses/{id}/usuarios/{usuarioId}:
 *   delete:
 *     summary: Remover usuario de In House
 *     tags: [In Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario removido exitosamente
 */
router.delete('/:id/usuarios/:usuarioId', verificarRol('admin', 'admin_area'), removerUsuario);

/**
 * @swagger
 * /inhouses/{id}/tiempo-real:
 *   get:
 *     summary: Obtener estado en tiempo real del In House
 *     description: Muestra usuarios activos e inactivos del In House
 *     tags: [In Houses]
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
 *         description: Estado en tiempo real
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalUsuarios:
 *                       type: number
 *                     usuariosActivos:
 *                       type: number
 *                     usuariosInactivos:
 *                       type: number
 *                 usuariosActivos:
 *                   type: array
 *                 usuariosInactivos:
 *                   type: array
 */
router.get('/:id/tiempo-real', obtenerTiempoReal);

/**
 * @swagger
 * /inhouses/{id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del In House
 *     tags: [In Houses]
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
 *         description: Estadísticas del In House
 */
router.get('/:id/estadisticas', obtenerEstadisticas);

module.exports = router;
