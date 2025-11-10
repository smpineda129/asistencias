/**
 * Servicio para integración con HID DigitalPersona U.are.U 4500
 * usando HID DigitalPersona Lite Client
 * 
 * IMPORTANTE: Este servicio requiere HID DigitalPersona Lite Client
 * instalado y corriendo en la máquina local.
 * 
 * Instalación:
 * 1. Descargar e instalar HID DigitalPersona Lite Client desde:
 *    https://digitalpersona.hidglobal.com/lite-client
 * 2. El cliente debe estar corriendo en http://localhost:5000
 * 3. Conectar el lector DigitalPersona U.are.U 4500 vía USB
 * 
 * API REST:
 * - GET  /info - Información del lector
 * - POST /capture - Capturar huella
 * - POST /verify - Verificar huella
 */

class FingerprintService {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.initialized = false;
    this.deviceInfo = {
      modelo: 'DigitalPersona 4500',
      serial: null,
      version: null,
      connected: false
    };
  }

  /**
   * Inicializa y verifica la conexión con el Lite Client
   */
  async initialize() {
    try {
      console.log('🔌 Conectando con HID DigitalPersona Lite Client...');
      
      const response = await fetch(`${this.baseURL}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el Lite Client. Verifique que esté corriendo.');
      }

      const info = await response.json();
      
      this.deviceInfo = {
        modelo: info.deviceName || 'DigitalPersona 4500',
        serial: info.serialNumber || 'Unknown',
        version: info.version || 'Unknown',
        connected: info.connected || false
      };

      if (!this.deviceInfo.connected) {
        throw new Error('Lector no conectado. Verifique la conexión USB.');
      }

      this.initialized = true;
      console.log('✅ Lector de huellas inicializado:', this.deviceInfo);
      return true;

    } catch (error) {
      console.error('❌ Error al inicializar lector de huellas:', error);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Captura una huella dactilar
   * @returns {Promise<Object>} Objeto con template y calidad
   */
  async captureFingerprint() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('📸 Esperando captura de huella...');

      const response = await fetch(`${this.baseURL}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeout: 10000 // 10 segundos de timeout
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al capturar huella');
      }

      const data = await response.json();

      if (!data.template) {
        throw new Error('No se pudo obtener el template de la huella.');
      }

      console.log('✅ Huella capturada exitosamente. Calidad:', data.quality || 'N/A');

      return {
        template: data.template, // Template en formato base64
        calidad: data.quality || 75,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error al capturar huella:', error);
      throw error;
    }
  }

  /**
   * Captura múltiples muestras para mejor precisión
   * @param {number} samples - Número de muestras a capturar (recomendado: 3)
   * @returns {Promise<Object>} Mejor muestra capturada
   */
  async captureMultipleSamples(samples = 3) {
    const captures = [];
    
    for (let i = 0; i < samples; i++) {
      console.log(`📸 Captura ${i + 1} de ${samples}...`);
      
      try {
        const capture = await this.captureFingerprint();
        captures.push(capture);
        
        // Pequeña pausa entre capturas
        await this.sleep(500);
      } catch (error) {
        console.error(`Error en captura ${i + 1}:`, error);
      }
    }

    if (captures.length === 0) {
      throw new Error('No se pudo capturar ninguna muestra válida.');
    }

    // Retornar la muestra con mejor calidad
    const bestCapture = captures.reduce((best, current) => 
      current.calidad > best.calidad ? current : best
    );

    console.log(`✅ Mejor captura: ${bestCapture.calidad}% de calidad`);
    return bestCapture;
  }

  /**
   * Verifica si el lector está disponible
   */
  async checkReaderAvailable() {
    try {
      const response = await fetch(`${this.baseURL}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          available: false,
          message: 'Lite Client no está corriendo. Inicie el servicio.'
        };
      }

      const info = await response.json();

      if (!info.connected) {
        return {
          available: false,
          message: 'Lector no conectado. Verifique la conexión USB.'
        };
      }

      return {
        available: true,
        message: 'Lector disponible',
        device: info
      };

    } catch (error) {
      return {
        available: false,
        message: 'No se pudo conectar con el Lite Client. Verifique que esté instalado y corriendo.'
      };
    }
  }

  /**
   * Calcula la calidad de la captura
   * @param {Object} acquisitionData - Datos de adquisición
   * @returns {number} Calidad (0-100)
   */
  calculateQuality(acquisitionData) {
    // El SDK de DigitalPersona proporciona un score de calidad
    // Si está disponible, usarlo. Si no, calcular basado en otros factores
    
    if (acquisitionData.Quality !== undefined) {
      return Math.round(acquisitionData.Quality);
    }

    // Cálculo alternativo basado en el tamaño de los datos
    // (esto es una aproximación, el SDK real proporciona mejor métrica)
    const dataSize = acquisitionData.Data?.length || 0;
    
    if (dataSize > 5000) return 85;
    if (dataSize > 3000) return 70;
    if (dataSize > 2000) return 60;
    if (dataSize > 1000) return 50;
    return 40;
  }

  /**
   * Obtiene información del dispositivo
   */
  getDeviceInfo() {
    return this.deviceInfo;
  }

  /**
   * Libera recursos del lector
   */
  async release() {
    try {
      this.initialized = false;
      console.log('✅ Lector de huellas liberado');
    } catch (error) {
      console.error('Error al liberar lector:', error);
    }
  }

  /**
   * Utilidad para pausar ejecución
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica si el Lite Client está disponible (sin inicializar el lector)
   */
  async isSDKAvailable() {
    try {
      const response = await fetch(`${this.baseURL}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instancia singleton
const fingerprintService = new FingerprintService();
export default fingerprintService;
