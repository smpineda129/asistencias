/**
 * Servicio para integración con HID DigitalPersona U.are.U 4500
 * usando @digitalpersona/devices
 * 
 * IMPORTANTE: Este servicio requiere:
 * 1. DigitalPersona WebSDK Service corriendo en Windows
 * 2. Lector DigitalPersona U.are.U 4500 conectado vía USB
 * 3. Librerías instaladas: npm install @digitalpersona/devices @digitalpersona/core
 * 4. Solo funciona en entorno local (no en producción)
 * 
 * Documentación:
 * https://github.com/hidglobal/digitalpersona-devices
 */

// Importación condicional para evitar errores en build de producción
let FingerprintReader, SampleFormat, Utf8;

try {
  const devices = require('@digitalpersona/devices');
  const core = require('@digitalpersona/core');
  FingerprintReader = devices.FingerprintReader;
  SampleFormat = devices.SampleFormat;
  Utf8 = core.Utf8;
} catch (error) {
  console.warn('⚠️ @digitalpersona/devices no disponible. El lector biométrico solo funciona en entorno local.');
}

class FingerprintService {
  constructor() {
    this.reader = null;
    this.initialized = false;
    this.deviceInfo = {
      modelo: 'DigitalPersona 4500',
      serial: null,
      version: null,
      connected: false
    };
  }

  /**
   * Inicializa el lector de huellas
   */
  async initialize() {
    try {
      if (!FingerprintReader) {
        throw new Error('SDK no disponible. El lector biométrico solo funciona en entorno local con las librerías instaladas.');
      }

      console.log('🔌 Inicializando lector DigitalPersona...');
      
      // Crear instancia del lector
      this.reader = new FingerprintReader();
      
      // Obtener lista de dispositivos
      const devices = await this.reader.enumerateDevices();
      
      if (!devices || devices.length === 0) {
        throw new Error('No se detectó ningún lector de huellas. Verifique que esté conectado.');
      }

      const device = devices[0];
      this.deviceInfo = {
        modelo: device.deviceId || 'DigitalPersona 4500',
        serial: device.deviceId || 'Unknown',
        version: device.version || 'Unknown',
        connected: true
      };

      this.initialized = true;
      console.log('✅ Lector de huellas inicializado:', this.deviceInfo);
      return true;

    } catch (error) {
      console.error('❌ Error al inicializar lector de huellas:', error);
      this.initialized = false;
      throw new Error('No se pudo conectar con el lector. Verifique que el DigitalPersona WebSDK Service esté corriendo.');
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

      // Iniciar adquisición
      await this.reader.startAcquisition(SampleFormat.PngImage);

      // Esperar captura (el lector emite un evento cuando captura)
      const sample = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: No se detectó huella en 10 segundos'));
        }, 10000);

        this.reader.on('SamplesAcquired', (event) => {
          clearTimeout(timeout);
          resolve(event.samples[0]);
        });

        this.reader.on('ErrorOccurred', (event) => {
          clearTimeout(timeout);
          reject(new Error(event.error || 'Error al capturar huella'));
        });
      });

      // Detener adquisición
      await this.reader.stopAcquisition();

      if (!sample || !sample.Data) {
        throw new Error('No se pudo capturar la huella. Intente nuevamente.');
      }

      // Convertir a base64
      const template = Utf8.fromByteArray(sample.Data);
      const calidad = this.calculateQuality(sample);

      console.log('✅ Huella capturada exitosamente. Calidad:', calidad);

      return {
        template: template,
        calidad: calidad,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error al capturar huella:', error);
      // Asegurarse de detener la adquisición
      try {
        await this.reader.stopAcquisition();
      } catch (e) {}
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
      if (!FingerprintReader) {
        return {
          available: false,
          message: 'SDK no disponible. El lector biométrico solo funciona en entorno local.'
        };
      }

      const reader = new FingerprintReader();
      const devices = await reader.enumerateDevices();
      
      if (!devices || devices.length === 0) {
        return {
          available: false,
          message: 'Lector no conectado. Verifique la conexión USB.'
        };
      }

      return {
        available: true,
        message: 'Lector disponible',
        device: devices[0]
      };

    } catch (error) {
      return {
        available: false,
        message: 'No se pudo conectar con el lector. Verifique que el DigitalPersona WebSDK Service esté corriendo.'
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
      if (this.reader) {
        await this.reader.stopAcquisition();
      }
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
   * Verifica si el SDK está disponible (sin inicializar el lector)
   */
  async isSDKAvailable() {
    try {
      if (!FingerprintReader) {
        return false;
      }
      const reader = new FingerprintReader();
      const devices = await reader.enumerateDevices();
      return devices && devices.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instancia singleton
const fingerprintService = new FingerprintService();
export default fingerprintService;
