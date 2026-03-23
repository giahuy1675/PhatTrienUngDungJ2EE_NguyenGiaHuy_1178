-- Update Product table để lưu base64 images
USE bangiay_db;

ALTER TABLE products 
MODIFY COLUMN image LONGTEXT,
MODIFY COLUMN images LONGTEXT;

-- Kiểm tra lại cấu trúc
DESCRIBE products;
