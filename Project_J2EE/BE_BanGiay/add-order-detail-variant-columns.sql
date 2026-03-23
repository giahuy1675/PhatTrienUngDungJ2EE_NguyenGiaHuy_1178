-- Add variant information columns to order_details table
-- This allows storing size, color, and image specific to the variant ordered

USE bangiay_db;

-- Add columns for variant information
ALTER TABLE order_details 
ADD COLUMN selected_size VARCHAR(50) NULL COMMENT 'Size được chọn (e.g., "38", "39", "XL")',
ADD COLUMN selected_color VARCHAR(50) NULL COMMENT 'Màu được chọn (e.g., "Đỏ", "Xanh")',
ADD COLUMN selected_image TEXT NULL COMMENT 'Ảnh sản phẩm tương ứng với variant đã chọn';

-- Show the updated table structure
DESCRIBE order_details;

-- Show sample data
SELECT id, product_id, quantity, selected_size, selected_color, 
       SUBSTRING(selected_image, 1, 50) as selected_image_preview
FROM order_details
LIMIT 5;
