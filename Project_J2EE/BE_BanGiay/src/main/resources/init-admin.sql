CREATE DATABASE IF NOT EXISTS bangiay_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bangiay_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE brands (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  logo LONGTEXT DEFAULT NULL,
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(15,2) NOT NULL,
  original_price DECIMAL(15,2) DEFAULT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  discount_start_at DATETIME(6) DEFAULT NULL,
  discount_end_at DATETIME(6) DEFAULT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  brand_id BIGINT DEFAULT NULL,
  color VARCHAR(50) DEFAULT NULL,
  image LONGTEXT DEFAULT NULL,
  images LONGTEXT DEFAULT NULL,
  colors TEXT DEFAULT NULL,
  sizes TEXT DEFAULT NULL,
  variants LONGTEXT DEFAULT NULL,
  specs TEXT DEFAULT NULL,
  rating DOUBLE DEFAULT NULL,
  reviews INT DEFAULT 0,
  tag VARCHAR(50) DEFAULT NULL,
  is_featured BIT(1) NOT NULL DEFAULT b'0',
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  category_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_products_brand_id (brand_id),
  KEY idx_products_category_id (category_id),
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  shipping_fee DECIMAL(15,2) DEFAULT 0.00,
  discount DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
  shipping_address VARCHAR(200) NOT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(15) NOT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  delivered_at DATETIME(6) DEFAULT NULL,
  payment_reference VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_number (order_number),
  KEY idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_details (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0.00,
  subtotal DECIMAL(15,2) NOT NULL,
  selected_size VARCHAR(50) DEFAULT NULL,
  selected_color VARCHAR(50) DEFAULT NULL,
  selected_image LONGTEXT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_order_details_order_id (order_id),
  KEY idx_order_details_product_id (product_id),
  CONSTRAINT fk_order_details_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_order_details_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  selected_size VARCHAR(50) DEFAULT NULL,
  selected_color VARCHAR(50) DEFAULT NULL,
  selected_image LONGTEXT DEFAULT NULL,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_cart_items_user_id (user_id),
  KEY idx_cart_items_product_id (product_id),
  CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_reviews (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  order_id BIGINT DEFAULT NULL,
  parent_id BIGINT DEFAULT NULL,
  rating INT DEFAULT NULL,
  content TEXT NOT NULL,
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_product_reviews_product_id (product_id),
  KEY idx_product_reviews_user_id (user_id),
  KEY idx_product_reviews_order_id (order_id),
  KEY idx_product_reviews_parent_id (parent_id),
  CONSTRAINT fk_product_reviews_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_product_reviews_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_product_reviews_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_product_reviews_parent FOREIGN KEY (parent_id) REFERENCES product_reviews (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (email, password, full_name, phone_number, address, role, is_active)
VALUES
  (
    'admin@bangiay.com',
    '$2a$10$N9qo8uLOickgx2ZMxMNxze1Z0e0VU7PkW0YJKRGZhL4y7VGqQXGqW',
    'Administrator',
    '0123456789',
    'Admin Office',
    'ADMIN',
    b'1'
  ),
  (
    'user@bangiay.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Khach hang',
    '0987654321',
    '123 Duong ABC, Quan 1, TP HCM',
    'USER',
    b'1'
  );

INSERT INTO categories (name, description, image_url, is_active)
VALUES
  ('Giay The Thao', 'Giay the thao cho moi hoat dong', '/images/categories/sport.jpg', b'1'),
  ('Giay Chay Bo', 'Giay chuyen dung cho chay bo', '/images/categories/running.jpg', b'1'),
  ('Giay Bong Ro', 'Giay bong ro chuyen nghiep', '/images/categories/basketball.jpg', b'1'),
  ('Giay Lifestyle', 'Giay phong cach doi thuong', '/images/categories/lifestyle.jpg', b'1');

INSERT INTO brands (name, description, logo, is_active)
VALUES
  ('Nike', 'Thuong hieu the thao hang dau the gioi', NULL, b'1'),
  ('Adidas', 'Thuong hieu the thao noi tieng cua Duc', NULL, b'1'),
  ('Converse', 'Thuong hieu giay the thao co dien', NULL, b'1');

INSERT INTO products (
  name,
  description,
  price,
  original_price,
  discount_percentage,
  discount_start_at,
  discount_end_at,
  stock_quantity,
  brand_id,
  color,
  image,
  images,
  colors,
  sizes,
  variants,
  specs,
  rating,
  reviews,
  tag,
  is_featured,
  is_active,
  category_id
)
VALUES
  (
    'Nike Air Max 270',
    'Giay the thao thoai mai voi dem khi Max Air',
    2800000.00,
    3500000.00,
    20.00,
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    50,
    (SELECT id FROM brands WHERE name = 'Nike'),
    'Trang',
    '/images/products/nike-air-max-270-main.jpg',
    '["/images/products/nike-air-max-270-main.jpg","/images/products/nike-air-max-270-2.jpg"]',
    '["#ffffff","#000000"]',
    '["40","41","42","43"]',
    '[{"color":"#ffffff","colorName":"Trang","images":["/images/products/nike-air-max-270-main.jpg"],"stockQuantity":25},{"color":"#000000","colorName":"Den","images":["/images/products/nike-air-max-270-2.jpg"],"stockQuantity":25}]',
    '["De cao su","Than giay em","Phu hop tap luyen"]',
    4.5,
    12,
    'Ban chay',
    b'1',
    b'1',
    (SELECT id FROM categories WHERE name = 'Giay The Thao')
  ),
  (
    'Adidas Ultraboost 22',
    'Giay chay bo voi cong nghe Boost',
    3500000.00,
    4200000.00,
    16.67,
    NOW(),
    DATE_ADD(NOW(), INTERVAL 20 DAY),
    30,
    (SELECT id FROM brands WHERE name = 'Adidas'),
    'Den',
    '/images/products/adidas-ultraboost-main.jpg',
    '["/images/products/adidas-ultraboost-main.jpg","/images/products/adidas-ultraboost-2.jpg"]',
    '["#111111","#1f4fff"]',
    '["39","40","41","42"]',
    '[{"color":"#111111","colorName":"Den","images":["/images/products/adidas-ultraboost-main.jpg"],"stockQuantity":20},{"color":"#1f4fff","colorName":"Xanh","images":["/images/products/adidas-ultraboost-2.jpg"],"stockQuantity":10}]',
    '["Ho tro chay bo","Dem Boost","Trong luong nhe"]',
    4.7,
    8,
    'Moi',
    b'1',
    b'1',
    (SELECT id FROM categories WHERE name = 'Giay Chay Bo')
  ),
  (
    'Jordan 1 Retro High',
    'Giay bong ro kinh dien',
    5000000.00,
    NULL,
    0.00,
    NULL,
    NULL,
    20,
    (SELECT id FROM brands WHERE name = 'Nike'),
    'Do/Trang',
    '/images/products/jordan-1-main.jpg',
    '["/images/products/jordan-1-main.jpg","/images/products/jordan-1-2.jpg"]',
    '["#d60000","#ffffff"]',
    '["41","42","43"]',
    '[{"color":"#d60000","colorName":"Do","images":["/images/products/jordan-1-main.jpg"],"stockQuantity":12},{"color":"#ffffff","colorName":"Trang","images":["/images/products/jordan-1-2.jpg"],"stockQuantity":8}]',
    '["Co cao","Phong cach classic","Chat lieu da tong hop"]',
    4.8,
    5,
    'Hot',
    b'1',
    b'1',
    (SELECT id FROM categories WHERE name = 'Giay Bong Ro')
  ),
  (
    'Converse Chuck Taylor',
    'Giay lifestyle co dien',
    1200000.00,
    1500000.00,
    20.00,
    NOW(),
    DATE_ADD(NOW(), INTERVAL 15 DAY),
    100,
    (SELECT id FROM brands WHERE name = 'Converse'),
    'Den',
    '/images/products/converse-main.jpg',
    '["/images/products/converse-main.jpg","/images/products/converse-2.jpg"]',
    '["#111111","#ffffff"]',
    '["38","39","40","41","42"]',
    '[{"color":"#111111","colorName":"Den","images":["/images/products/converse-main.jpg"],"stockQuantity":60},{"color":"#ffffff","colorName":"Trang","images":["/images/products/converse-2.jpg"],"stockQuantity":40}]',
    '["De cao su","Thiet ke toi gian","De pho do"]',
    4.3,
    15,
    'Giam gia',
    b'0',
    b'1',
    (SELECT id FROM categories WHERE name = 'Giay Lifestyle')
  );

SELECT 'Email admin: admin@bangiay.com | Password: admin123' AS info;
SELECT 'Email user: user@bangiay.com | Password: user123' AS info;
