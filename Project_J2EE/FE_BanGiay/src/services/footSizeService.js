import api from './api';

const footSizeService = {
  phanTich: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/foot-size/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000 // timeout 60s vì cần thời gian xử lý
    });
    return response.data;
  }
};

export default footSizeService;
