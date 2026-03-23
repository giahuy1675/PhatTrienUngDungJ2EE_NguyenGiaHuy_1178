import api from './api';
import { getParsedStorageItem } from '../utils/helpers';

const cartService = {
  // Lấy giỏ hàng
  getCart: async () => {
    const user = getParsedStorageItem('user', {});
    const userId = user?.id;
    if (!userId) throw new Error('User not found');
    
    const response = await api.get(`/cart/${userId}`);
    
    // Debug log
    console.log('📥 getCart Response:', response.data.map(item => ({
      id: item.id,
      productName: item.productName,
      selectedColor: item.selectedColor,
      hasSelectedImage: !!item.selectedImage,
      hasProductImage: !!item.productImage,
      selectedImagePreview: item.selectedImage ? item.selectedImage.substring(0, 50) + '...' : null,
      productImagePreview: item.productImage ? item.productImage.substring(0, 50) + '...' : null
    })));
    
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity, selectedSize = null, selectedColor = null, selectedImage = null) => {
    const user = getParsedStorageItem('user', {});
    const userId = user?.id;
    if (!userId) throw new Error('User not found');
    
    const payload = { 
      productId, 
      quantity,
      selectedSize,
      selectedColor,
      selectedImage
    };
    
    // Debug log
    console.log('📤 Sending to API:', {
      url: `/cart/${userId}`,
      payload: {
        ...payload,
        selectedImage: selectedImage ? selectedImage.substring(0, 50) + '...' : null
      }
    });
    
    const response = await api.post(`/cart/${userId}`, payload);
    
    // Debug response
    console.log('📥 API Response:', {
      ...response.data,
      selectedImage: response.data.selectedImage ? response.data.selectedImage.substring(0, 50) + '...' : null
    });
    
    return response.data;
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const user = getParsedStorageItem('user', {});
    const userId = user?.id;
    if (!userId) throw new Error('User not found');
    
    const response = await api.delete(`/cart/clear/${userId}`);
    return response.data;
  },
};

export default cartService;
