-- Xem FULL variants JSON
SELECT variants 
FROM products 
WHERE id = 5 
INTO OUTFILE 'C:/ProgramData/MySQL/MySQL Server 8.4/Uploads/variants_product_5.json';

-- Sau đó mở file: C:/ProgramData/MySQL/MySQL Server 8.4/Uploads/variants_product_5.json

-- Hoặc xem trực tiếp (double-click vào cell variants trong kết quả query bên dưới):
SELECT id, name, color, variants FROM products WHERE id = 5;
