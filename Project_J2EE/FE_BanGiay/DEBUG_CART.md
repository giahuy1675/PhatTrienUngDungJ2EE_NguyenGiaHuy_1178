# Debug Guide - Giỏ hàng

## Các bước kiểm tra khi thêm vào giỏ hàng không hiển thị:

### 1. Kiểm tra đăng nhập
- Mở Console (F12)
- Kiểm tra `localStorage.getItem('token')` có giá trị không
- Nếu không có token → Đăng nhập trước

### 2. Kiểm tra API Call
Mở Network tab trong DevTools, khi click "Thêm vào giỏ":
- POST `/api/cart` - Thêm sản phẩm
- GET `/api/cart` - Lấy danh sách giỏ hàng

**Lỗi thường gặp:**
- 401 Unauthorized → Token hết hạn, đăng nhập lại
- 404 Not Found → Backend chưa chạy
- CORS error → Backend chưa config CORS đúng

### 3. Kiểm tra Response Format
Backend trả về `CartItemResponse[]`:
```json
[
  {
    "id": 1,
    "productId": 5,
    "productName": "Nike Air Max",
    "productImage": "...",
    "productPrice": 500000,
    "selectedSize": "42",
    "selectedColor": "Black",
    "quantity": 2,
    "subtotal": 1000000
  }
]
```

### 4. Test trong Console
```javascript
// Kiểm tra token
localStorage.getItem('token')

// Kiểm tra user
localStorage.getItem('user')

// Test API call trực tiếp
fetch('http://localhost:8080/api/cart', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
```

### 5. Kiểm tra Backend
- Backend đang chạy ở `http://localhost:8080`?
- Endpoint `/api/cart` đã implement chưa?
- Database có bảng `cart_items` chưa?

### 6. Khởi động lại
Nếu vẫn lỗi:
1. Clear localStorage: `localStorage.clear()`
2. Đăng nhập lại
3. Thử thêm sản phẩm
4. Check console & network tab
