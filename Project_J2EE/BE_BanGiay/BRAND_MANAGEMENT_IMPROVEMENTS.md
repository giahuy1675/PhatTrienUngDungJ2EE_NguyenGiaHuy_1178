# Cải tiến hệ thống quản lý thương hiệu (Brand Management)

## Tổng quan
Đã nâng cấp hệ thống để quản lý thương hiệu (brands) như một entity riêng biệt thay vì chỉ là chuỗi văn bản trong Product. Navbar và ProductsPage giờ load dữ liệu danh mục và thương hiệu động từ backend.

## Các thay đổi Backend

### 1. Entity mới - Brand.java
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/entity/Brand.java`

Entity mới để quản lý thương hiệu với các trường:
- `id`: ID tự tăng
- `name`: Tên thương hiệu (unique, bắt buộc)
- `description`: Mô tả thương hiệu
- `logo`: URL hoặc base64 của logo
- `isActive`: Trạng thái kích hoạt
- `createdAt`, `updatedAt`: Thời gian tạo/cập nhật
- `products`: Quan hệ OneToMany với Product

### 2. Repository mới - BrandRepository.java
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/repository/BrandRepository.java`

Các methods:
- `findAllByIsActiveTrue()`: Lấy tất cả thương hiệu đang active
- `findByName(String name)`: Tìm thương hiệu theo tên
- `existsByName(String name)`: Kiểm tra tồn tại

### 3. Controller mới - BrandController.java
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/controller/BrandController.java`

API endpoints:
- `GET /api/brands` - Lấy tất cả thương hiệu active
- `GET /api/brands/{id}` - Lấy chi tiết thương hiệu
- `GET /api/brands/admin/all` - Admin: Lấy tất cả thương hiệu với số lượng sản phẩm
- `POST /api/brands/admin` - Admin: Tạo thương hiệu mới
- `PUT /api/brands/admin/{id}` - Admin: Cập nhật thương hiệu
- `DELETE /api/brands/admin/{id}` - Admin: Xóa thương hiệu

### 4. Cập nhật Product entity
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/entity/Product.java`

Thay đổi:
```java
// CŨ:
@Column(length = 100)
private String brand;

// MỚI:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "brand_id")
@JsonIgnoreProperties({"products"})
private Brand brand;
```

### 5. Cập nhật ProductRepository
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/repository/ProductRepository.java`

Thêm method:
```java
List<Product> findByBrandIdAndIsActiveTrue(Long brandId);
```

### 6. Cập nhật ProductController
**File**: `BE_BanGiay/src/main/java/com/example/be_bangiay/controller/ProductController.java`

Thêm endpoint:
```java
@GetMapping("/brand/{brandId}")
public ResponseEntity<List<Product>> getProductsByBrand(@PathVariable Long brandId)
```

## Các thay đổi Frontend

### 1. Service mới - brandService.js
**File**: `FE_BanGiay/src/services/brandService.js`

Service để gọi API thương hiệu:
- `getAllBrands()`: Lấy tất cả thương hiệu
- `getBrandById(id)`: Lấy chi tiết thương hiệu

### 2. Cập nhật Navbar.jsx
**File**: `FE_BanGiay/src/components/Navbar.jsx`

Thay đổi:
- Import `categoryService` và `brandService`
- Thêm state `categories` và `brands`
- Fetch dữ liệu động khi component mount
- Tạo navigation object động từ dữ liệu API
- Không còn hardcode danh mục và thương hiệu

```javascript
// Fetch categories và brands từ API
const [categoriesData, brandsData] = await Promise.all([
  categoryService.getAllCategories(),
  brandService.getAllBrands()
]);
```

### 3. Cập nhật ProductsPage.jsx
**File**: `FE_BanGiay/src/pages/ProductsPage.jsx`

Thay đổi:
- Import `brandService`
- Thêm state `brands`
- Fetch brands từ API thay vì dùng mảng hardcode
- Cập nhật logic lọc theo brand:
  ```javascript
  // CŨ:
  filtered = filtered.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
  
  // MỚI:
  filtered = filtered.filter(p => 
    p.brand && 
    p.brand.name && 
    p.brand.name.toLowerCase() === selectedBrand.toLowerCase()
  );
  ```
- Cập nhật UI render brands để dùng `brand.name` và `brand.id`

## Migration SQL

### File migration: migrate-brands.sql
**File**: `BE_BanGiay/migrate-brands.sql`

Script migration bao gồm:
1. Tạo bảng `brands`
2. Insert thương hiệu từ dữ liệu hiện có trong bảng `products`
3. Thêm cột `brand_id` vào bảng `products`
4. Thêm foreign key constraint
5. Migrate dữ liệu - link products với brands
6. Insert các thương hiệu phổ biến (Nike, Adidas, Puma, Converse, Vans, New Balance)

**LƯU Ý**: Sau khi chạy migration và verify dữ liệu, có thể uncomment dòng cuối để drop cột `brand` cũ.

## Cách sử dụng

### 1. Chạy migration SQL
```sql
mysql -u root -p bangiay_db < migrate-brands.sql
```

### 2. Restart backend
```bash
cd BE_BanGiay
./mvnw spring-boot:run
```

### 3. Restart frontend
```bash
cd FE_BanGiay
npm run dev
```

### 4. Kiểm tra

1. **Navbar**: Mở trang chủ, nhấn vào menu "Sản Phẩm" - sẽ thấy:
   - Section "Danh Mục": Load động từ database
   - Section "Thương Hiệu": Load động từ database

2. **Filter trang sản phẩm**: 
   - Sidebar "Thương Hiệu" sẽ hiển thị các brand từ database
   - Click vào brand sẽ lọc sản phẩm của brand đó

3. **URL Parameters**:
   - `/products?category=Giày Thể Thao` - Lọc theo danh mục
   - `/products?brand=Nike` - Lọc theo thương hiệu

## Lợi ích

1. **Quản lý tập trung**: Admin có thể quản lý thương hiệu từ 1 nơi
2. **Nhất quán dữ liệu**: Tránh lỗi chính tả, case sensitivity
3. **Mở rộng**: Dễ thêm logo, mô tả cho từng thương hiệu
4. **Performance**: Index trên brand_id nhanh hơn so với string comparison
5. **Dynamic UI**: Navbar và filters tự động cập nhật khi có brand mới

## API Documentation

### Public Endpoints

#### GET /api/brands
Lấy tất cả thương hiệu đang active

**Response**:
```json
[
  {
    "id": 1,
    "name": "Nike",
    "description": "Thương hiệu thể thao hàng đầu thế giới",
    "logo": null,
    "isActive": true,
    "createdAt": "2024-02-06T10:00:00",
    "updatedAt": "2024-02-06T10:00:00"
  }
]
```

#### GET /api/products/brand/{brandId}
Lấy sản phẩm theo thương hiệu

**Response**: Array of Product objects

### Admin Endpoints

Require `ROLE_ADMIN` và Bearer token trong header `Authorization`

#### GET /api/brands/admin/all
Lấy tất cả thương hiệu kèm số lượng sản phẩm

#### POST /api/brands/admin
Tạo thương hiệu mới

**Request body**:
```json
{
  "name": "New Balance",
  "description": "Thương hiệu giày chạy bộ Mỹ",
  "logo": "https://example.com/logo.png"
}
```

#### PUT /api/brands/admin/{id}
Cập nhật thương hiệu

#### DELETE /api/brands/admin/{id}
Xóa thương hiệu (cascade delete products)

## TODO - Improvements tiếp theo

1. **Admin UI**: Tạo giao diện quản lý thương hiệu trong admin panel
2. **Brand Logo**: Hiển thị logo thương hiệu trong product card và filters
3. **Brand Page**: Tạo trang riêng cho mỗi thương hiệu với giới thiệu
4. **Statistics**: Thống kê số lượng sản phẩm, doanh số theo thương hiệu
5. **Soft Delete**: Thay vì xóa hard, chỉ set isActive = false
6. **SEO**: Tối ưu URL slugs cho brand pages
