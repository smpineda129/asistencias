import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import fingerprintService from '../services/fingerprintService';
import { biometricAPI } from '../utils/api';

const DEDOS = [
  { value: 'pulgar_derecho', label: 'Pulgar Derecho', hand: 'right' },
  { value: 'indice_derecho', label: 'Índice Derecho', hand: 'right' },
  { value: 'medio_derecho', label: 'Medio Derecho', hand: 'right' },
  { value: 'anular_derecho', label: 'Anular Derecho', hand: 'right' },
  { value: 'menique_derecho', label: 'Meñique Derecho', hand: 'right' },
  { value: 'pulgar_izquierdo', label: 'Pulgar Izquierdo', hand: 'left' },
  { value: 'indice_izquierdo', label: 'Índice Izquierdo', hand: 'left' },
  { value: 'medio_izquierdo', label: 'Medio Izquierdo', hand: 'left' },
  { value: 'anular_izquierdo', label: 'Anular Izquierdo', hand: 'left' },
  { value: 'menique_izquierdo', label: 'Meñique Izquierdo', hand: 'left' }
];

const FingerprintEnrollment = ({ usuario, onSuccess, onCancel }) => {
  const [step, setStep] = useState('select'); // select, capture, processing, success, error
  const [selectedFinger, setSelectedFinger] = useState('');
  const [readerStatus, setReaderStatus] = useState({ available: false, message: '' });
  const [capturing, setCapturing] = useState(false);
  const [captureData, setCaptureData] = useState(null);
  const [error, setError] = useState('');
  const [huellasExistentes, setHuellasExistentes] = useState([]);

  useEffect(() => {
    checkReader();
    loadExistingFingerprints();
  }, []);

  const checkReader = async () => {
    try {
      const status = await fingerprintService.checkReaderAvailable();
      setReaderStatus(status);
    } catch (error) {
      setReaderStatus({
        available: false,
        message: 'Error al verificar lector: ' + error.message
      });
    }
  };

  const loadExistingFingerprints = async () => {
    try {
      const response = await biometricAPI.obtenerHuellasUsuario(usuario._id);
      setHuellasExistentes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar huellas existentes:', error);
    }
  };

  const isDedoRegistrado = (dedo) => {
    return huellasExistentes.some(h => h.dedo === dedo && h.activo);
  };

  const handleCapture = async () => {
    if (!selectedFinger) {
      setError('Por favor seleccione un dedo');
      return;
    }

    if (isDedoRegistrado(selectedFinger)) {
      setError('Este dedo ya tiene una huella registrada');
      return;
    }

    setCapturing(true);
    setError('');
    setStep('capture');

    try {
      // Capturar múltiples muestras para mejor calidad
      const capture = await fingerprintService.captureMultipleSamples(3);
      
      setCaptureData(capture);
      setStep('processing');

      // Enviar al servidor
      const response = await biometricAPI.registrarHuella({
        usuarioId: usuario._id,
        template: capture.template,
        dedo: selectedFinger,
        calidad: capture.calidad,
        deviceInfo: fingerprintService.getDeviceInfo()
      });

      if (response.data.success) {
        setStep('success');
        setTimeout(() => {
          if (onSuccess) onSuccess(response.data.data);
        }, 2000);
      }

    } catch (error) {
      console.error('Error al capturar huella:', error);
      setError(error.response?.data?.message || error.message || 'Error al capturar huella');
      setStep('error');
    } finally {
      setCapturing(false);
    }
  };

  const handleRetry = () => {
    setStep('select');
    setError('');
    setCaptureData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Fingerprint className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Registro de Huella Dactilar</h2>
            <p className="text-sm text-gray-600">
              {usuario.nombre} {usuario.apellidos}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Estado del lector */}
      <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
        readerStatus.available 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        {readerStatus.available ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <div>
          <p className={`font-medium ${
            readerStatus.available ? 'text-green-800' : 'text-red-800'
          }`}>
            {readerStatus.available ? 'Lector Conectado' : 'Lector No Disponible'}
          </p>
          <p className={`text-sm ${
            readerStatus.available ? 'text-green-600' : 'text-red-600'
          }`}>
            {readerStatus.message}
          </p>
        </div>
      </div>

      {/* Contenido según el paso */}
      {step === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccione el dedo a registrar
          </label>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Mano Derecha */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Mano Derecha</h3>
              <div className="space-y-2">
                {DEDOS.filter(d => d.hand === 'right').map(dedo => {
                  const registrado = isDedoRegistrado(dedo.value);
                  return (
                    <button
                      key={dedo.value}
                      onClick={() => !registrado && setSelectedFinger(dedo.value)}
                      disabled={registrado}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedFinger === dedo.value
                          ? 'border-blue-500 bg-blue-50'
                          : registrado
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dedo.label}</span>
                        {registrado && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mano Izquierda */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Mano Izquierda</h3>
              <div className="space-y-2">
                {DEDOS.filter(d => d.hand === 'left').map(dedo => {
                  const registrado = isDedoRegistrado(dedo.value);
                  return (
                    <button
                      key={dedo.value}
                      onClick={() => !registrado && setSelectedFinger(dedo.value)}
                      disabled={registrado}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedFinger === dedo.value
                          ? 'border-blue-500 bg-blue-50'
                          : registrado
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dedo.label}</span>
                        {registrado && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCapture}
              disabled={!selectedFinger || !readerStatus.available || capturing}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Capturar Huella
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'capture' && (
        <div className="text-center py-8">
          <div className="inline-block animate-pulse mb-4">
            <Fingerprint className="w-24 h-24 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Capturando Huella...
          </h3>
          <p className="text-gray-600 mb-4">
            Por favor, coloque su dedo en el lector
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Procesando 3 muestras...</span>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <Loader className="w-24 h-24 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Procesando Huella...
          </h3>
          <p className="text-gray-600">
            Calidad de captura: {captureData?.calidad}%
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <CheckCircle className="w-24 h-24 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ¡Huella Registrada Exitosamente!
          </h3>
          <p className="text-gray-600">
            {DEDOS.find(d => d.value === selectedFinger)?.label}
          </p>
          {captureData && (
            <p className="text-sm text-gray-500 mt-2">
              Calidad: {captureData.calidad}%
            </p>
          )}
        </div>
      )}

      {step === 'error' && (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <XCircle className="w-24 h-24 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Error al Registrar Huella
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Intentar Nuevamente
          </button>
        </div>
      )}
    </div>
  );
};

export default FingerprintEnrollment;
