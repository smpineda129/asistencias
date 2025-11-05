/**
 * Servicio para integración con DigitalPersona U.are.U 4500
 * 
 * IMPORTANTE: Este servicio requiere que el DigitalPersona WebSDK esté instalado
 * y el servicio de DigitalPersona esté corriendo en la máquina local.
 * 
 * Instalación:
 * 1. Descargar e instalar DigitalPersona U.are.U SDK desde:
 *    https://www.digitalpersona.com/support/
 * 2. Instalar el servicio WebSDK que corre en localhost
 * 3. Incluir el script en public/index.html:
 *    <script src="https://localhost:8443/websdk/websdk-bundle.js"></script>
 */

class FingerprintService {
  constructor() {
    this.sdk = null;
    this.reader = null;
    this.initialized = false;
    this.deviceInfo = {
      modelo: 'DigitalPersona 4500',
      serial: null,
      version: null
    };
  }

  /**
   * Inicializa el SDK de DigitalPersona
   */
  async initialize() {
    try {
      // Verificar si el SDK está disponible
      if (typeof window.Fingerprint === 'undefined') {
        throw new Error('DigitalPersona WebSDK no está cargado. Asegúrese de que el servicio esté corriendo.');
      }

      this.sdk = window.Fingerprint;
      
      // Obtener lista de dispositivos
      const devices = await this.sdk.DeviceConnected();
      
      if (!devices || devices.length === 0) {
        throw new Error('No se detectó ningún lector de huellas. Verifique que esté conectado.');
      }

      this.reader = devices[0];
      this.deviceInfo.serial = this.reader.DeviceID || 'Unknown';
      this.initialized = true;

      console.log('✅ Lector de huellas inicializado:', this.deviceInfo);
      return true;

    } catch (error) {
      console.error('❌ Error al inicializar lector de huellas:', error);
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

      // Crear un objeto de adquisición
      const acquisitionData = await this.sdk.AcquireFingerprintSample();

      if (!acquisitionData || !acquisitionData.Data) {
        throw new Error('No se pudo capturar la huella. Intente nuevamente.');
      }

      // Extraer características (crear FMD - Fingerprint Minutiae Data)
      const fmd = await this.sdk.CreateFmd(acquisitionData.Data);

      if (!fmd || !fmd.Data) {
        throw new Error('No se pudieron extraer las características de la huella.');
      }

      // Calcular calidad
      const quality = this.calculateQuality(acquisitionData);

      console.log('✅ Huella capturada exitosamente. Calidad:', quality);

      return {
        template: fmd.Data, // Template en formato base64
        calidad: quality,
        raw: acquisitionData.Data, // Datos raw (opcional, para debug)
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
      if (typeof window.Fingerprint === 'undefined') {
        return {
          available: false,
          message: 'SDK no cargado. Instale DigitalPersona WebSDK.'
        };
      }

      const devices = await window.Fingerprint.DeviceConnected();
      
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
        message: `Error: ${error.message}`
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
      if (this.sdk && this.sdk.StopAcquisition) {
        await this.sdk.StopAcquisition();
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
  isSDKAvailable() {
    return typeof window.Fingerprint !== 'undefined';
  }
}

// Exportar instancia singleton
const fingerprintService = new FingerprintService();
export default fingerprintService;
