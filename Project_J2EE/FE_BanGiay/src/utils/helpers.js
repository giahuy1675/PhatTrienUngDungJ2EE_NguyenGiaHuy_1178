// Utility functions

// Format giá tiền
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Format ngày tháng
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate số điện thoại
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

// Parse JSON an toàn từ localStorage
export const getParsedStorageItem = (key, fallback = null) => {
  const rawValue = localStorage.getItem(key);

  if (!rawValue || rawValue === 'undefined' || rawValue === 'null') {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Invalid JSON in localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return fallback;
  }
};
