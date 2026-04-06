import api from './api';

const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Lấy chi tiết danh mục
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
