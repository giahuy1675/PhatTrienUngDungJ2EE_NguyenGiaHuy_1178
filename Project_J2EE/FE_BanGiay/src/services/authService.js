import api from './api';

const authService = {
  // Đăng nhập
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { email: identifier, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Đăng ký
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Đăng nhập Google
  loginWithGoogle: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
  },

  // Kiểm tra token
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
