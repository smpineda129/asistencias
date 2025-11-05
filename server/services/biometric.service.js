const crypto = require('crypto');

/**
 * Servicio de Biometría para DigitalPersona 4500
 * 
 * NOTA IMPORTANTE: Este servicio proporciona la estructura backend.
 * La captura real de huellas se realiza en el cliente (navegador) usando
 * el SDK de DigitalPersona WebSDK que se comunica directamente con el lector USB.
 * 
 * El flujo es:
 * 1. Cliente captura huella con WebSDK -> obtiene FMD (Fingerprint Minutiae Data)
 * 2. Cliente envía FMD al servidor
 * 3. Servidor encripta y almacena el FMD
 * 4. Para verificación: Cliente captura -> envía FMD -> Servidor compara
 */

class BiometricService {
  constructor() {
    // Configuración de encriptación
    this.algorithm = 'aes-256-cbc';
    this.key = this.getEncryptionKey();
  }

  /**
   * Obtiene la clave de encriptación desde variables de entorno
   * o genera una por defecto (en producción debe estar en .env)
   */
  getEncryptionKey() {
    const key = process.env.BIOMETRIC_ENCRYPTION_KEY;
    if (!key) {
      console.warn('⚠️  ADVERTENCIA: No se encontró BIOMETRIC_ENCRYPTION_KEY en .env');
      console.warn('⚠️  Usando clave por defecto (NO SEGURO PARA PRODUCCIÓN)');
      // Generar clave de 32 bytes para AES-256
      return crypto.scryptSync('default-key-change-in-production', 'salt', 32);
    }
    return crypto.scryptSync(key, 'salt', 32);
  }

  /**
   * Encripta un template de huella (FMD)
   * @param {string} template - Template en formato base64 o string
   * @returns {string} Template encriptado
   */
  encryptTemplate(template) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(template, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Retornar IV + encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error al encriptar template:', error);
      throw new Error('Error al encriptar datos biométricos');
    }
  }

  /**
   * Desencripta un template de huella
   * @param {string} encryptedTemplate - Template encriptado
   * @returns {string} Template desencriptado
   */
  decryptTemplate(encryptedTemplate) {
    try {
      const parts = encryptedTemplate.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error al desencriptar template:', error);
      throw new Error('Error al desencriptar datos biométricos');
    }
  }

  /**
   * Valida la calidad de un template de huella
   * @param {number} quality - Calidad reportada por el SDK (0-100)
   * @returns {boolean} true si la calidad es aceptable
   */
  validateQuality(quality) {
    const MIN_QUALITY = 50; // Calidad mínima aceptable
    return quality >= MIN_QUALITY;
  }

  /**
   * Valida el formato de un template FMD
   * @param {string} template - Template a validar
   * @returns {boolean} true si el formato es válido
   */
  validateTemplateFormat(template) {
    if (!template || typeof template !== 'string') {
      return false;
    }
    
    // Validar que sea base64 o tenga un formato válido
    // Los templates FMD de DigitalPersona suelen ser strings base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(template) && template.length > 100;
  }

  /**
   * Compara dos templates de huellas
   * NOTA: En producción, esta comparación debería hacerse usando el SDK
   * de DigitalPersona en el servidor o mediante su servicio de verificación.
   * Esta es una implementación simplificada.
   * 
   * @param {string} template1 - Primer template (encriptado)
   * @param {string} template2 - Segundo template (sin encriptar)
   * @returns {Object} Resultado de la comparación
   */
  compareTemplates(template1Encrypted, template2Plain) {
    try {
      // Desencriptar el template almacenado
      const template1 = this.decryptTemplate(template1Encrypted);
      
      // IMPORTANTE: Esta es una comparación simplificada
      // En producción real, debes usar el SDK de DigitalPersona
      // para hacer la comparación biométrica real
      
      // Por ahora, verificamos coincidencia exacta (para desarrollo)
      // En producción, el SDK retorna un score de similitud
      const isMatch = template1 === template2Plain;
      
      return {
        match: isMatch,
        score: isMatch ? 100 : 0,
        confidence: isMatch ? 'high' : 'none'
      };
    } catch (error) {
      console.error('Error al comparar templates:', error);
      return {
        match: false,
        score: 0,
        confidence: 'error',
        error: error.message
      };
    }
  }

  /**
   * Genera metadata para un registro biométrico
   * @param {Object} deviceInfo - Información del dispositivo
   * @returns {Object} Metadata estructurada
   */
  generateMetadata(deviceInfo = {}) {
    return {
      resolucion: deviceInfo.resolution || '500 DPI',
      formato: deviceInfo.format || 'ANSI-378',
      tamanio: deviceInfo.size || 0,
      capturedAt: new Date().toISOString()
    };
  }

  /**
   * Valida que los datos de registro sean completos
   * @param {Object} enrollmentData - Datos de registro
   * @returns {Object} Resultado de validación
   */
  validateEnrollmentData(enrollmentData) {
    const errors = [];

    if (!enrollmentData.usuarioId) {
      errors.push('ID de usuario es requerido');
    }

    if (!enrollmentData.template) {
      errors.push('Template de huella es requerido');
    } else if (!this.validateTemplateFormat(enrollmentData.template)) {
      errors.push('Formato de template inválido');
    }

    if (!enrollmentData.dedo) {
      errors.push('Dedo es requerido');
    }

    if (enrollmentData.calidad === undefined || enrollmentData.calidad === null) {
      errors.push('Calidad es requerida');
    } else if (!this.validateQuality(enrollmentData.calidad)) {
      errors.push(`Calidad insuficiente (${enrollmentData.calidad}%). Mínimo requerido: 50%`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera un hash del template para búsquedas rápidas (opcional)
   * @param {string} template - Template de huella
   * @returns {string} Hash del template
   */
  generateTemplateHash(template) {
    return crypto
      .createHash('sha256')
      .update(template)
      .digest('hex');
  }
}

module.exports = new BiometricService();
