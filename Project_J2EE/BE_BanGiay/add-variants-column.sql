-- Add variants column to products table
ALTER TABLE products ADD COLUMN variants LONGTEXT COMMENT 'JSON array of product variants with colors and images';
