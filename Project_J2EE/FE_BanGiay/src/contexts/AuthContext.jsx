import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { getParsedStorageItem } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userData = getParsedStorageItem('user', null);
      
      if (token && userData) {
          setUser(userData);
      } else if (token && !userData) {
          localStorage.removeItem('token');
        }

      setLoading(false);
    };

    initAuth();
  }, []);

  const normalizeAuthResponse = (response, actionName) => {
    const token = response?.token;
    const normalizedUser = response?.user || {
      id: response?.id,
      email: response?.email,
      fullName: response?.fullName,
      role: response?.role,
    };

    if (!token || !normalizedUser?.email) {
      throw new Error(`Dữ liệu ${actionName} trả về không hợp lệ`);
    }

    return { token, normalizedUser };
  };

  const login = async (identifier, password) => {
    try {
      const response = await authService.login(identifier, password);
      const { token, normalizedUser } = normalizeAuthResponse(response, 'đăng nhập');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setUser(normalizedUser);
      return { ...response, user: normalizedUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token, normalizedUser } = normalizeAuthResponse(response, 'đăng ký');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setUser(normalizedUser);
      return { ...response, user: normalizedUser };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await authService.loginWithGoogle(idToken);
      const { token, normalizedUser } = normalizeAuthResponse(response, 'đăng nhập Google');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      setUser(normalizedUser);
      return { ...response, user: normalizedUser };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
