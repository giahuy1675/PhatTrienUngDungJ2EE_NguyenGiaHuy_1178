# 🛍️ Dự Án BẢN GIÀY (Shoe Store E-commerce)

## 📌 Tổng Quan

Đây là một dự án **J2EE fullstack** - ứng dụng thương mại điện tử bán giày hoàn toàn với backend Spring Boot và frontend React.

---

## 🏗️ Kiến Trúc Dự Án

### **Backend (BE_BanGiay)**
| Thông Số | Chi Tiết |
|---------|---------|
| Framework | Spring Boot 4.0.2 |
| Ngôn ngữ | Java 17 |
| Database | MySQL 8.0 |
| ORM | Spring Data JPA + Hibernate |
| Bảo mật | Spring Security + JWT |
| Build Tool | Maven |

**Cấu trúc Backend:**
```
src/main/java/com/example/be_bangiay/
├── controller/        # API endpoints
├── service/          # Business logic
├── repository/       # Database access
├── entity/           # JPA entities
├── dto/              # Data transfer objects
├── config/           # Configuration classes
├── security/         # JWT, Security configs
└── exception/        # Custom exceptions
```

### **Frontend (FE_BanGiay)**
| Thông Số | Chi Tiết |
|---------|---------|
| Framework | React 18.2 |
| Build & Dev | Vite 5.0.8 |
| Styling | Tailwind CSS + Ant Design (antd) |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State Management | React Context API |

**Cấu trúc Frontend:**
```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API services
├── contexts/        # React Context (Auth, Cart)
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
└── utils/           # Utilities & constants
```

---

## ✨ Tính Năng Chính

### 👥 **Người Dùng**
- ✅ Đăng ký / Đăng nhập
- ✅ Google OAuth 2.0 Integration
- ✅ Quản lý hồ sơ cá nhân
- ✅ Lịch sử đơn hàng

### 🛒 **Mua Sắm**
- ✅ Duyệt sản phẩm theo danh mục
- ✅ Tìm kiếm & lọc sản phẩm
- ✅ Giỏ hàng (Add/Remove/Update)
- ✅ Checkout và thanh toán

### 💳 **Thanh Toán**
- ✅ VNPAY Payment Gateway (Sandbox mode)
- ✅ Xác nhận thanh toán qua IPN
- ✅ Quản lý đơn hàng

### ⭐ **Đánh Giá & Đánh Điểm**
- ✅ Viết review cho sản phẩm
- ✅ Xem đánh giá từ người dùng khác
- ✅ Quản lý review (Admin)

### 👨‍💼 **Admin Dashboard**
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục
- ✅ Quản lý thương hiệu (Brand)
- ✅ Quản lý người dùng
- ✅ Quản lý đơn hàng
- ✅ Quản lý review
- ✅ Báo cáo & Thống kê

---

## 🔧 Yêu Cầu Hệ Thống

- **JDK 17** hoặc cao hơn
- **Node.js** (cho frontend)
- **MySQL Server 8.0**
- **Apache Tomcat 9.0** (tuỳ chọn)

---

## 📁 Cấu Trúc Thư Mục Chính

```
PhatTrienUngDungJ2EE_NguyenGiaHuy_1178/
├── README_Setup.txt              # Hướng dẫn cài đặt
├── DBConnection.java             # Kết nối database
├── BaoCao_TienDo_CaNhan.md       # Báo cáo tiến độ
├── Project_J2EE/
│   ├── BE_BanGiay/               # Backend Spring Boot
│   │   ├── pom.xml
│   │   ├── src/
│   │   ├── *.sql                 # Database migration scripts
│   │   └── *.md                  # Documentation
│   │
│   ├── FE_BanGiay/               # Frontend React
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── src/
│   │
│   ├── debug-query.sql           # Debug SQL queries
│   ├── test-api.html             # API testing page
│   └── package.json
```

---

## 🌐 Tích Hợp Ngoài

| Dịch Vụ | Mục Đích | API Key |
|---------|----------|---------|
| Google OAuth | Đăng nhập | google.oauth.client-id |
| VNPAY | Thanh toán | vnpay.tmnCode: OFMVG14Q |
| JWT | Xác thực | jwt.secret: (custom key) |

---

## 📊 Cấu Hình Database

**Database Name:** `bangiay_db`

**Credentials:**
- Username: `root`
- Password: *(blank - cần cấu hình)*

**Engine:** MySQL 8.0

**Key Tables:**
- `users` - Người dùng
- `products` - Sản phẩm
- `categories` - Danh mục
- `brands` - Thương hiệu
- `orders` - Đơn hàng
- `order_details` - Chi tiết đơn hàng
- `product_images` - Hình ảnh sản phẩm
- `product_variants` - Biến thể sản phẩm
- `reviews` - Đánh giá
- `cart_items` - Giỏ hàng

---

## 🚀 Cách Chạy Dự Án

### Backend
```bash
cd Project_J2EE/BE_BanGiay
mvn clean install
mvn spring-boot:run
# Truy cập: http://localhost:8080
```

### Frontend
```bash
cd Project_J2EE/FE_BanGiay
npm install
npm run dev
# Truy cập: http://localhost:5173
```

---

## 📝 Ghi Chú

- Backend chạy trên port **8080**
- Frontend chạy trên port **5173** (Vite default)
- VNPAY ở chế độ **Sandbox** (test mode)
- JWT Token expiration: **24 hours** (86400000 ms)

---

## 👨‍⚕️ Tác Giả

**Nguyễn Gia Huy** (Mã SV: 1178)

---

*Cập nhật lần cuối: April 4, 2026*
