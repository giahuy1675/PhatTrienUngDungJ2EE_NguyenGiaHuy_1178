# Frontend - Bán Giày

Dự án React + Vite + Tailwind CSS

## Cấu trúc thư mục

```
FE_BanGiay/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryList.jsx
│   │   ├── CartItem.jsx
│   │   ├── Loading.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── PrivateRoute.jsx
│   │
│   ├── pages/              # Các trang chính
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── AdminPage.jsx
│   │
│   ├── services/           # API services
│   │   ├── api.js         # Axios config
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── categoryService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   └── userService.js
│   │
│   ├── contexts/           # React Context
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useFetch.js
│   │
│   ├── utils/              # Utilities
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173

## Build production

```bash
npm run build
```

## Ghi chú

- Tất cả các file pages và components đã được tạo sẵn cấu trúc cơ bản
- Bạn có thể tự phát triển giao diện theo ý muốn
- API services đã được cấu hình sẵn để kết nối với backend
- Tailwind CSS đã được cấu hình với các utility classes tùy chỉnh
- Context API đã được thiết lập cho Authentication và Cart management

## Các chức năng cần phát triển

1. **Authentication**
   - Login / Register
   - Logout
   - Protected routes

2. **Products**
   - Danh sách sản phẩm
   - Chi tiết sản phẩm
   - Tìm kiếm & filter

3. **Cart**
   - Thêm/xóa/cập nhật giỏ hàng
   - Hiển thị tổng tiền

4. **Orders**
   - Checkout
   - Danh sách đơn hàng
   - Chi tiết đơn hàng

5. **Profile**
   - Xem/cập nhật thông tin
   - Đổi mật khẩu

6. **Admin**
   - Quản lý sản phẩm
   - Quản lý đơn hàng
   - Quản lý danh mục
