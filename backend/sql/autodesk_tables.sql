-- Autodesk Categories Table
CREATE TABLE autodesk_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO autodesk_categories (name, sort_order) VALUES 
('All Products', 0),
('Architecture, Engineering & Construction', 1),
('Product Design & Manufacturing', 2),
('Media & Entertainment', 3);

-- Product Categories Relationship Table
CREATE TABLE product_categories (
    product_id INT,
    category_id INT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES autodesk_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Autodesk FAQs Table
CREATE TABLE autodesk_faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Autodesk Page Content Table
CREATE TABLE autodesk_page (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banner_image VARCHAR(255),
    banner_title VARCHAR(255),
    banner_subtitle TEXT,
    help_section_title VARCHAR(255),
    help_section_description TEXT,
    quote_button_text VARCHAR(100),
    quote_button_link VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add new columns to autodesk_page table
ALTER TABLE autodesk_page 
ADD COLUMN banner_button_text VARCHAR(50) DEFAULT 'Learn more',
ADD COLUMN banner_button_link VARCHAR(255) DEFAULT '#'; 

-- Insert default record in autodesk_page
INSERT INTO autodesk_page (
    id, 
    banner_title, 
    banner_subtitle, 
    banner_button_text, 
    banner_button_link,
    banner_image,
    help_section_title,
    help_section_description,
    quote_button_text,
    quote_button_link
) VALUES (
    1,
    'Autodesk AI helps you do more with less',
    'Our AI technology is available in Autodesk products to help you stay ahead of industry demands and technological shifts—boosting ambition, creativity, and sustainability.',
    'Learn more',
    '#',
    '/images/autodesk-banner.jpg',
    'Need help finding the right product?',
    'Our product experts are here to help you choose the best solution for your needs.',
    'Get a Quote',
    '/contact'
) ON DUPLICATE KEY UPDATE id = id; 