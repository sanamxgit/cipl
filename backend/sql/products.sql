-- Add category_id column if not exists
ALTER TABLE products 
ADD COLUMN category_id INT NULL,
ADD CONSTRAINT fk_product_category 
FOREIGN KEY (category_id) REFERENCES autodesk_categories(id) 
ON DELETE SET NULL; 