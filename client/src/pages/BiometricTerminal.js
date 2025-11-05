import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, CheckCircle, XCircle, Clock, User, LogIn, LogOut, AlertCircle } from 'lucide-react';
import fingerprintService from '../services/fingerprintService';
import { biometricAPI } from '../utils/api';

const BiometricTerminal = () => {
  const [readerStatus, setReaderStatus] = useState({ available: false, message: '' });
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const resultTimeoutRef = useRef(null);

  useEffect(() => {
    checkReader();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-iniciar escaneo cuando el lector esté disponible
    if (readerStatus.available && !scanning && !showResult) {
      startScanning();
    }
  }, [readerStatus.available, scanning, showResult]);

  const checkReader = async () => {
    try {
      const status = await fingerprintService.checkReaderAvailable();
      setReaderStatus(status);
      
      if (!status.available) {
        // Reintentar cada 5 segundos si el lector no está disponible
        setTimeout(checkReader, 5000);
      }
    } catch (error) {
      setReaderStatus({
        available: false,
        message: 'Error al verificar lector'
      });
      setTimeout(checkReader, 5000);
    }
  };

  const startScanning = async () => {
    if (!readerStatus.available || scanning) return;

    setScanning(true);
    
    try {
      // Capturar huella
      const capture = await fingerprintService.captureFingerprint();
      
      // Verificar con el servidor
      const response = await biometricAPI.verificarHuella({
        template: capture.template
      });

      if (response.data.success) {
        handleSuccessfulScan(response.data.data);
      }

    } catch (error) {
      console.error('Error al escanear:', error);
      
      if (error.response?.status === 404) {
        handleFailedScan('Huella no reconocida');
      } else {
        handleFailedScan(error.response?.data?.message || 'Error al verificar huella');
      }
    } finally {
      setScanning(false);
    }
  };

  const handleSuccessfulScan = (data) => {
    setLastResult({
      success: true,
      action: data.action,
      usuario: data.usuario,
      asistencia: data.asistencia,
      biometric: data.biometric,
      timestamp: new Date()
    });

    // Agregar a actividad reciente
    setRecentActivity(prev => [
      {
        id: data.asistencia.id,
        usuario: data.usuario.nombreCompleto,
        action: data.action,
        time: data.asistencia[data.action === 'ingreso' ? 'horaIngreso' : 'horaSalida'],
        timestamp: new Date()
      },
      ...prev.slice(0, 9) // Mantener solo las últimas 10
    ]);

    setShowResult(true);

    // Ocultar resultado después de 5 segundos y reiniciar escaneo
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    resultTimeoutRef.current = setTimeout(() => {
      setShowResult(false);
      setLastResult(null);
      startScanning();
    }, 5000);
  };

  const handleFailedScan = (message) => {
    setLastResult({
      success: false,
      message,
      timestamp: new Date()
    });

    setShowResult(true);

    // Ocultar resultado después de 3 segundos y reiniciar escaneo
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    resultTimeoutRef.current = setTimeout(() => {
      setShowResult(false);
      setLastResult(null);
      startScanning();
    }, 3000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Control de Asistencia Biométrico
          </h1>
          <div className="text-blue-200 text-xl">
            {formatDate(currentTime)}
          </div>
          <div className="text-white text-5xl font-bold mt-2">
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Estado del lector */}
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                readerStatus.available 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                {readerStatus.available ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div className="flex-1">
                  <p className={`font-bold ${
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

              {/* Área de escaneo */}
              {!showResult && (
                <div className="text-center py-12">
                  <div className={`inline-block mb-6 ${scanning ? 'animate-pulse' : ''}`}>
                    <div className="bg-blue-100 p-8 rounded-full">
                      <Fingerprint className="w-32 h-32 text-blue-600" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {scanning ? 'Escaneando...' : 'Coloque su dedo en el lector'}
                  </h2>
                  
                  <p className="text-gray-600 text-lg mb-8">
                    {scanning 
                      ? 'Procesando huella dactilar...'
                      : 'El sistema está listo para registrar su asistencia'
                    }
                  </p>

                  {!readerStatus.available && (
                    <button
                      onClick={checkReader}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Verificar Lector
                    </button>
                  )}
                </div>
              )}

              {/* Resultado del escaneo */}
              {showResult && lastResult && (
                <div className="text-center py-12">
                  {lastResult.success ? (
                    <>
                      <div className="inline-block mb-6">
                        <div className={`p-8 rounded-full ${
                          lastResult.action === 'ingreso' 
                            ? 'bg-green-100' 
                            : 'bg-orange-100'
                        }`}>
                          {lastResult.action === 'ingreso' ? (
                            <LogIn className="w-32 h-32 text-green-600" />
                          ) : (
                            <LogOut className="w-32 h-32 text-orange-600" />
                          )}
                        </div>
                      </div>

                      <h2 className={`text-4xl font-bold mb-4 ${
                        lastResult.action === 'ingreso' 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        {lastResult.action === 'ingreso' 
                          ? '¡Bienvenido!' 
                          : '¡Hasta Pronto!'}
                      </h2>

                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <User className="w-8 h-8 text-gray-600" />
                          <p className="text-3xl font-bold text-gray-800">
                            {lastResult.usuario.nombreCompleto}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <p className="text-xl">
                            {lastResult.action === 'ingreso' 
                              ? lastResult.asistencia.horaIngreso
                              : lastResult.asistencia.horaSalida}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Calidad de verificación: {lastResult.biometric.confidence}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="inline-block mb-6">
                        <div className="bg-red-100 p-8 rounded-full">
                          <AlertCircle className="w-32 h-32 text-red-600" />
                        </div>
                      </div>

                      <h2 className="text-4xl font-bold text-red-600 mb-4">
                        Acceso Denegado
                      </h2>

                      <p className="text-xl text-gray-700 mb-6">
                        {lastResult.message}
                      </p>

                      <p className="text-gray-600">
                        Por favor, intente nuevamente o contacte al administrador
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel de Actividad Reciente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Actividad Reciente
              </h3>

              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay actividad reciente
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={activity.id + index}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {activity.action === 'ingreso' ? (
                            <LogIn className="w-4 h-4 text-green-600" />
                          ) : (
                            <LogOut className="w-4 h-4 text-orange-600" />
                          )}
                          <span className={`text-xs font-semibold uppercase ${
                            activity.action === 'ingreso' 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {activity.action}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm">
                        {activity.usuario}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                Instrucciones
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Coloque su dedo en el lector de huellas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Mantenga el dedo quieto hasta que se complete el escaneo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>El sistema registrará automáticamente su ingreso o salida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Espere la confirmación en pantalla</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricTerminal;
