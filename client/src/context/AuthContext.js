import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  // Verificar si hay un usuario guardado al cargar
  useEffect(() => {
    verificarAutenticacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verificarAutenticacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (token && usuarioGuardado) {
        // Verificar que el token sea válido
        const response = await authAPI.verificarToken();
        if (response.data.success) {
          setUsuario(JSON.parse(usuarioGuardado));
          setAutenticado(true);
        } else {
          cerrarSesion();
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      
      // Si el error es de JWT inválido, limpiar localStorage silenciosamente
      if (error.response?.status === 401 || error.message?.includes('jwt')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
        setAutenticado(false);
      } else {
        cerrarSesion();
      }
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesion = async (correo, password) => {
    try {
      const response = await authAPI.login({ correo, password });
      
      if (response.data.success) {
        const { token, usuario } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Actualizar estado
        setUsuario(usuario);
        setAutenticado(true);
        
        // Mostrar mensaje de éxito
        toast.success(`¡Bienvenido/a ${usuario.nombreCompleto}!`, {
          duration: 4000,
          icon: '👋'
        });
        
        return { success: true, usuario };
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const mensaje = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(mensaje);
      return { success: false, message: mensaje };
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setAutenticado(false);
    toast.success('Sesión cerrada correctamente');
  };

  const esAdmin = () => {
    return usuario?.rol === 'admin';
  };

  const esCEO = () => {
    return usuario?.rol === 'ceo';
  };

  const esUsuario = () => {
    return usuario?.rol === 'user';
  };

  const esEncargado = () => {
    return usuario?.rol === 'encargado_inhouse';
  };

  const esAdminArea = () => {
    return usuario?.rol === 'admin_area';
  };

  const value = {
    usuario,
    autenticado,
    cargando,
    iniciarSesion,
    cerrarSesion,
    esAdmin,
    esCEO,
    esUsuario,
    esEncargado,
    esAdminArea
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
