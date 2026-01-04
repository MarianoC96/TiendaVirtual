import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Estados iniciales de autenticación
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null, // 'admin' | 'user'
};

// Tipos de acciones para el reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer para manejar las acciones de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.user.role,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Datos mock de usuarios para desarrollo
const mockUsers = [
  {
    id: 1,
    email: 'admin@tienda.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'usuario@tienda.com',
    password: 'user123',
    name: 'Usuario Demo',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150',
    createdAt: '2024-01-15',
    lastLogin: new Date().toISOString(),
  }
];

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay una sesión guardada al inicializar
  useEffect(() => {
    const checkAuthState = async () => {
      // VERSION CONTROL: Incrementar esto para invalidar sesiones viejas forzosamente
      const APP_VERSION = 'v1.1-db-integrated';
      const storedVersion = localStorage.getItem('app-version');

      if (storedVersion !== APP_VERSION) {
        console.log('Nueva versión detectada. Limpiando sesiones antiguas...');
        localStorage.clear(); // Limpiar TODO
        localStorage.setItem('app-version', APP_VERSION);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const savedToken = localStorage.getItem('auth-token');

      if (savedToken) {
        try {
          // Validar token con el backend
          const response = await axios.get('http://localhost:3001/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });

          const user = response.data;

          // CRITICAL FIX: Verificar que sea un objeto de usuario real y no HTML o basura
          if (!user || user.id === undefined || !user.email) {
            throw new Error('Respuesta inválida del servidor');
          }

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user }
          });

          // Actualizar user en localstorage por si acaso cambió
          localStorage.setItem('auth-user', JSON.stringify(user));

        } catch (error) {
          console.error('Session validation failed:', error);
          // Si falla, limpiar todo
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-token');
          dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        }
      } else {
        localStorage.removeItem('auth-user'); // Asegurar limpieza si no hay token
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthState();
  }, []);

  // Función de login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      const { user, token } = response.data;

      // Guardar en localStorage
      localStorage.setItem('auth-user', JSON.stringify(user));
      localStorage.setItem('auth-token', token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user }
      });

      return { success: true, user };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Función de registro
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      const { user } = response.data;

      // Auto login after register? Or just return success
      // For now, let's login automatically if server returned user
      // But server register currently doesn't return token. 
      // Let's just return success and ask user to login or modify server. 
      // The server I wrote returns user object but not token.

      return { success: true, message: 'Usuario registrado exitosamente' };

    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (updates) => {
    try {
      // Llamada API
      await axios.put(`http://localhost:3001/api/users/${state.user.id}`, {
        ...state.user,
        ...updates
      });

      const updatedUser = { ...state.user, ...updates };

      // Actualizar en localStorage
      localStorage.setItem('auth-user', JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updates
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Obtener token de autenticación
  const getToken = () => {
    return localStorage.getItem('auth-token');
  };

  // Valor del contexto
  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    role: state.role,

    // Acciones
    login,
    logout,
    register,
    updateProfile,

    // Utilidades
    isAdmin,
    getToken,

    // Datos mock para desarrollo
    mockUsers: mockUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
