-- Update amount columns to support larger values (precision from 10 to 15)
-- This prevents "Out of range value" errors when dealing with large quantities

-- Update orders table
ALTER TABLE orders 
MODIFY COLUMN total_amount DECIMAL(15, 2) NOT NULL,
MODIFY COLUMN shipping_fee DECIMAL(15, 2) DEFAULT 0.00,
MODIFY COLUMN discount DECIMAL(15, 2) DEFAULT 0.00;

-- Update order_details table
ALTER TABLE order_details
MODIFY COLUMN price DECIMAL(15, 2) NOT NULL,
MODIFY COLUMN discount DECIMAL(15, 2) DEFAULT 0.00,
MODIFY COLUMN subtotal DECIMAL(15, 2) NOT NULL;

-- Update products table
ALTER TABLE products
MODIFY COLUMN price DECIMAL(15, 2) NOT NULL,
MODIFY COLUMN original_price DECIMAL(15, 2);

-- Verify the changes
SELECT 
    'orders' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bangiay_db' 
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME IN ('total_amount', 'shipping_fee', 'discount')
UNION ALL
SELECT 
    'order_details' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bangiay_db' 
  AND TABLE_NAME = 'order_details'
  AND COLUMN_NAME IN ('price', 'discount', 'subtotal')
UNION ALL
SELECT 
    'products' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bangiay_db' 
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME IN ('price', 'original_price');
