import React, { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, []);

  // Update cart count
  useEffect(() => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null, selectedImage = null) => {
    try {
      await cartService.addToCart(productId, quantity, selectedSize, selectedColor, selectedImage);
      await fetchCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      throw error;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await cartService.updateCartItem(cartItemId, quantity);
      await fetchCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật giỏ hàng:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      await fetchCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.productPrice || 0) * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      fetchCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
