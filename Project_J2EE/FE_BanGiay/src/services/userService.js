import api from './api';

const userService = {
  // Lấy thông tin profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    const response = await api.put('/profile', userData);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/profile/change-password', { 
      oldPassword, 
      newPassword 
    });
    return response.data;
  },
};

export default userService;
