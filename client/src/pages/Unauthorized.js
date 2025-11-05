import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
        <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-600" size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-600 mb-8">
          No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un error.
        </p>
        
        <button
          onClick={() => navigate(-1)}
          className="btn-primary w-full"
        >
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
