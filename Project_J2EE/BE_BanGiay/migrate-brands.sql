-- Migration script to create brands table and migrate existing brand data

-- Step 1: Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo LONGTEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Insert existing brands from products table
INSERT INTO brands (name, is_active, created_at, updated_at)
SELECT DISTINCT brand, TRUE, NOW(), NOW()
FROM products
WHERE brand IS NOT NULL AND brand != ''
ON DUPLICATE KEY UPDATE name = name;

-- Step 3: Add brand_id column to products table
ALTER TABLE products ADD COLUMN brand_id BIGINT;

-- Step 4: Add foreign key constraint
ALTER TABLE products ADD CONSTRAINT fk_product_brand 
FOREIGN KEY (brand_id) REFERENCES brands(id);

-- Step 5: Migrate data - link products to brands
UPDATE products p
INNER JOIN brands b ON p.brand = b.name
SET p.brand_id = b.id
WHERE p.brand IS NOT NULL AND p.brand != '';

-- Step 6: Optional - Drop old brand column after verifying data
-- Uncomment the following line after verifying the migration
-- ALTER TABLE products DROP COLUMN brand;

-- Insert some popular brands if they don't exist
INSERT IGNORE INTO brands (name, description, is_active, created_at, updated_at) VALUES
('Nike', 'Thương hiệu thể thao hàng đầu thế giới', TRUE, NOW(), NOW()),
('Adidas', 'Thương hiệu thể thao nổi tiếng Đức', TRUE, NOW(), NOW()),
('Puma', 'Thương hiệu thể thao Đức', TRUE, NOW(), NOW()),
('Converse', 'Thương hiệu giày thể thao cổ điển Mỹ', TRUE, NOW(), NOW()),
('Vans', 'Thương hiệu giày lifestyle và skateboard', TRUE, NOW(), NOW()),
('New Balance', 'Thương hiệu giày chạy bộ Mỹ', TRUE, NOW(), NOW());
