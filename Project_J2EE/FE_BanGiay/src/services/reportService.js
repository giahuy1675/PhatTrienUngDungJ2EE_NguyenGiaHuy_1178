import api from './api';

const reportService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/reports/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 10) => {
    try {
      const response = await api.get(`/admin/reports/products/top-selling?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
  },

  // Get products with low stock
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/admin/reports/products/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },

  // Get products with high stock
  getHighStockProducts: async (threshold = 100) => {
    try {
      const response = await api.get(`/admin/reports/products/high-stock?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching high stock products:', error);
      throw error;
    }
  },

  // Get all product statistics
  getAllProductStats: async () => {
    try {
      const response = await api.get('/admin/reports/products/all-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching all product stats:', error);
      throw error;
    }
  },

  // Get top customers
  getTopCustomers: async (limit = 10) => {
    try {
      const response = await api.get(`/admin/reports/customers/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      throw error;
    }
  }
};

export default reportService;
