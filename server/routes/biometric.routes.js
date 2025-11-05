const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometric.controller');
const { protegerRuta, verificarRol } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Biometric
 *   description: Gestión de huellas dactilares y verificación biométrica
 */

/**
 * @swagger
 * /api/biometric/enroll:
 *   post:
 *     summary: Registrar una nueva huella dactilar
 *     tags: [Biometric]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - template
 *               - dedo
 *               - calidad
 *             properties:
 *               usuarioId:
 *                 type: string
 *               template:
 *                 type: string
 *                 description: Template FMD en base64
 *               dedo:
 *                 type: string
 *                 enum: [pulgar_derecho, indice_derecho, medio_derecho, anular_derecho, menique_derecho, pulgar_izquierdo, indice_izquierdo, medio_izquierdo, anular_izquierdo, menique_izquierdo]
 *               calidad:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               deviceInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Huella registrada exitosamente
 *       400:
 *         description: Datos inválidos o huella ya existe
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/enroll', protegerRuta, verificarRol('admin', 'admin_area'), biometricController.enrollFingerprint);

/**
 * @swagger
 * /api/biometric/verify:
 *   post:
 *     summary: Verificar huella y marcar asistencia
 *     tags: [Biometric]
 *     description: Endpoint para terminal de marcación con lector de huellas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 description: Template FMD capturado
 *               inHouseId:
 *                 type: string
 *                 description: ID del InHouse (opcional)
 *     responses:
 *       200:
 *         description: Huella verificada y asistencia marcada
 *       404:
 *         description: Huella no reconocida
 *       400:
 *         description: Datos inválidos
 */
router.post('/verify', biometricController.verifyAndCheckIn);

/**
 * @swagger
 * /api/biometric/user/{usuarioId}:
 *   get:
 *     summary: Obtener huellas de un usuario
 *     tags: [Biometric]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de huellas del usuario
 */
router.get('/user/:usuarioId', protegerRuta, biometricController.getUserFingerprints);

/**
 * @swagger
 * /api/biometric/user/{usuarioId}/check:
 *   get:
 *     summary: Verificar si un usuario tiene huellas registradas
 *     tags: [Biometric]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de registro de huellas
 */
router.get('/user/:usuarioId/check', protegerRuta, biometricController.checkUserHasFingerprints);

/**
 * @swagger
 * /api/biometric/{id}:
 *   delete:
 *     summary: Eliminar una huella
 *     tags: [Biometric]
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
 *         description: Huella eliminada exitosamente
 *       404:
 *         description: Huella no encontrada
 */
router.delete('/:id', protegerRuta, verificarRol('admin', 'admin_area'), biometricController.deleteFingerprint);

/**
 * @swagger
 * /api/biometric/stats:
 *   get:
 *     summary: Obtener estadísticas de uso biométrico
 *     tags: [Biometric]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema biométrico
 */
router.get('/stats', protegerRuta, verificarRol('admin', 'ceo'), biometricController.getBiometricStats);

module.exports = router;
