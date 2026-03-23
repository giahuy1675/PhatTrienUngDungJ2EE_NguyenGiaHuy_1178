import api from './api';
import { getParsedStorageItem } from '../utils/helpers';

const orderService = {
  createOrder: async (orderData) => {
    const user = getParsedStorageItem('user', null);
    if (!user) throw new Error('User not found. Please login again.');

    const userId = user.id;
    if (!userId) throw new Error('User ID not found');

    const response = await api.post(`/orders/${userId}`, orderData);
    return response.data;
  },

  createVnpayPayment: async (orderData) => {
    const user = getParsedStorageItem('user', null);
    if (!user) throw new Error('User not found. Please login again.');

    const userId = user.id;
    if (!userId) throw new Error('User ID not found');

    const response = await api.post(`/orders/${userId}/vnpay`, orderData);
    return response.data;
  },

  verifyVnpayReturn: async (queryString) => {
    const response = await api.get(`/orders/vnpay-return${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderService;
