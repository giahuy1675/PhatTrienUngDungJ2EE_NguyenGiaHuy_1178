import api from './api';

const brandService = {
  // Lấy tất cả thương hiệu
  getAllBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },

  // Lấy chi tiết thương hiệu
  getBrandById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
};

export default brandService;
