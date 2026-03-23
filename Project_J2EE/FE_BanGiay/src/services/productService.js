import api from './api';

const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword) => {
    const response = await api.get('/products/search', { params: { keyword } });
    return response.data;
  },

  // Lọc sản phẩm theo danh mục
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },
};

export default productService;
