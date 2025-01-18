-- Verify required tables exist
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'your_database_name'
AND TABLE_NAME IN ('products', 'product_brands', 'brands', 'product_categories');

-- Verify Autodesk brand exists
SELECT * FROM brands WHERE name = 'Autodesk';

-- Verify product relationships
SELECT COUNT(*) FROM product_brands 
WHERE brand_id = (SELECT id FROM brands WHERE name = 'Autodesk'); 

-- Verify Autodesk products
SELECT * FROM products 
WHERE brand_id = 5 
AND is_active = 1 
ORDER BY position, name;

-- Verify products with categories
SELECT p.*, pc.category_id 
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
WHERE p.brand_id = 5 
AND p.is_active = 1
ORDER BY p.position, p.name; 