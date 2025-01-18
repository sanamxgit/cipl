-- Table for brands
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    primary_button_text VARCHAR(50) DEFAULT 'Plans & Pricing',
    secondary_button_text VARCHAR(50) DEFAULT 'Free Trial',
    is_active BOOLEAN DEFAULT true,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Add new columns to the products table
ALTER TABLE products 
ADD COLUMN primary_button_text VARCHAR(50) DEFAULT 'Plans & Pricing' AFTER price,
ADD COLUMN secondary_button_text VARCHAR(50) DEFAULT 'Free Trial' AFTER primary_button_text;

-- Add category_id column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN category_id INT DEFAULT NULL,
ADD FOREIGN KEY (category_id) REFERENCES autodesk_categories(id) ON DELETE SET NULL; 