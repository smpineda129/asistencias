const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuariosPorRol
} = require('../controllers/user.controller');
const { protegerRuta, soloAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 */
router.get('/', soloAdmin, obtenerUsuarios);

/**
 * @route   GET /api/users/rol/:rol
 * @desc    Obtener usuarios por rol (solo admin)
 * @access  Private/Admin
 */
router.get('/rol/:rol', soloAdmin, obtenerUsuariosPorRol);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID (solo admin)
 * @access  Private/Admin
 */
router.get('/:id', soloAdmin, obtenerUsuarioPorId);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
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
 *               - apellidos
 *               - correo
 *               - password
 *               - celular
 *               - area
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellidos:
 *                 type: string
 *                 example: Pérez García
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@empresa.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               celular:
 *                 type: string
 *                 example: 555-1234
 *               area:
 *                 type: string
 *                 example: Desarrollo
 *               rol:
 *                 type: string
 *                 enum: [admin, ceo, user]
 *                 example: user
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error de validación o correo duplicado
 */
router.post('/', soloAdmin, crearUsuario);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               celular:
 *                 type: string
 *               area:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [admin, ceo, user]
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', soloAdmin, actualizarUsuario);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', soloAdmin, eliminarUsuario);

module.exports = router;
