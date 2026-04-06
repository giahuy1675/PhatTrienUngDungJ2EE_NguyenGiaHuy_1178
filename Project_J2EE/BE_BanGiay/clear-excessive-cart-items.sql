-- Clear cart items with excessive quantity to prevent order creation errors
-- This is a temporary fix to remove test data with unrealistic quantities

-- Show current cart items
SELECT 
    ci.id,
    ci.user_id,
    u.email,
    p.name as product_name,
    ci.quantity,
    ci.selected_color,
    ci.selected_size,
    (p.price * ci.quantity) as total_value
FROM cart_items ci
JOIN users u ON ci.user_id = u.id
JOIN products p ON ci.product_id = p.id
ORDER BY ci.quantity DESC;

-- Delete cart items with quantity > 10 (unrealistic test data)
DELETE FROM cart_items WHERE quantity > 10;

-- Or delete all cart items for user_id = 6 (Huy)
-- DELETE FROM cart_items WHERE user_id = 6;

-- Verify deletion
SELECT COUNT(*) as remaining_cart_items FROM cart_items;
