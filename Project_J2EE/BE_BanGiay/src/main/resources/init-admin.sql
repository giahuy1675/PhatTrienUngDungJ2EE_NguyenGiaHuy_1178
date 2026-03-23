-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS bangiay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bangiay_db;

-- Chạy backend để tạo bảng trước, sau đó chạy script này

-- Tạo tài khoản Admin
-- Email: admin@bangiay.com
-- Password: admin123
INSERT INTO users (email, password, full_name, phone_number, address, role, is_active, created_at, updated_at)
VALUES (
    'admin@bangiay.com',
    '$2a$10$N9qo8uLOickgx2ZMxMNxze1Z0e0VU7PkW0YJKRGZhL4y7VGqQXGqW', -- password: admin123
    'Administrator',
    '0123456789',
    'Admin Office',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Tạo tài khoản User thử nghiệm
-- Email: user@bangiay.com
-- Password: user123
INSERT INTO users (email, password, full_name, phone_number, address, role, is_active, created_at, updated_at)
VALUES (
    'user@bangiay.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: user123
    'Khách hàng',
    '0987654321',
    '123 Đường ABC, Quận 1, TP.HCM',
    'USER',
    true,
    NOW(),
    NOW()
);

-- Tạo danh mục mẫu
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at)
VALUES 
    ('Giày Thể Thao', 'Giày thể thao cho mọi hoạt động', '/images/categories/sport.jpg', true, NOW(), NOW()),
    ('Giày Chạy Bộ', 'Giày chuyên dụng cho chạy bộ', '/images/categories/running.jpg', true, NOW(), NOW()),
    ('Giày Bóng Rổ', 'Giày bóng rổ chuyên nghiệp', '/images/categories/basketball.jpg', true, NOW(), NOW()),
    ('Giày Lifestyle', 'Giày phong cách đời thường', '/images/categories/lifestyle.jpg', true, NOW(), NOW());

-- Tạo thương hiệu mẫu
INSERT INTO brands (name, description, is_active, created_at, updated_at)
VALUES 
    ('Nike', 'Thương hiệu thể thao hàng đầu thế giới', true, NOW(), NOW()),
    ('Adidas', 'Thương hiệu thể thao nổi tiếng của Đức', true, NOW(), NOW()),
    ('Converse', 'Thương hiệu giày thể thao cổ điển', true, NOW(), NOW());

-- Tạo sản phẩm mẫu (sử dụng brand_id thay vì brand string)
INSERT INTO products (name, description, price, sale_price, stock_quantity, brand_id, color, image_url, size, is_featured, is_active, category_id, created_at, updated_at)
VALUES 
    ('Nike Air Max 270', 'Giày thể thao thoải mái với đệm khí Max Air', 3500000, 2800000, 50, (SELECT id FROM brands WHERE name = 'Nike'), 'Trắng', '/images/products/nike-air-max-270.jpg', '42', true, true, (SELECT id FROM categories WHERE name = 'Giày Thể Thao'), NOW(), NOW()),
    ('Adidas Ultraboost 22', 'Giày chạy bộ với công nghệ Boost', 4200000, 3500000, 30, (SELECT id FROM brands WHERE name = 'Adidas'), 'Đen', '/images/products/adidas-ultraboost.jpg', '41', true, true, (SELECT id FROM categories WHERE name = 'Giày Chạy Bộ'), NOW(), NOW()),
    ('Jordan 1 Retro High', 'Giày bóng rổ kinh điển', 5000000, null, 20, (SELECT id FROM brands WHERE name = 'Nike'), 'Đỏ/Trắng', '/images/products/jordan-1.jpg', '43', true, true, (SELECT id FROM categories WHERE name = 'Giày Bóng Rổ'), NOW(), NOW()),
    ('Converse Chuck Taylor', 'Giày lifestyle cổ điển', 1500000, 1200000, 100, (SELECT id FROM brands WHERE name = 'Converse'), 'Đen', '/images/products/converse-chuck.jpg', '40', false, true, (SELECT id FROM categories WHERE name = 'Giày Lifestyle'), NOW(), NOW());

-- Hiển thị thông tin tài khoản
SELECT '=== TÀI KHOẢN ADMIN ===' as INFO;
SELECT 'Email: admin@bangiay.com' as INFO;
SELECT 'Password: admin123' as INFO;
SELECT '' as INFO;
SELECT '=== TÀI KHOẢN USER ===' as INFO;
SELECT 'Email: user@bangiay.com' as INFO;
SELECT 'Password: user123' as INFO;
