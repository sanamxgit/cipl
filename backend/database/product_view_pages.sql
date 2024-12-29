CREATE TABLE product_view_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    hero_image_url VARCHAR(255),
    hero_background_color VARCHAR(20) DEFAULT '#ffffff',
    hero_description TEXT,
    options JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_view_tabs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    button_text VARCHAR(100),
    button_url VARCHAR(255),
    position INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES product_view_pages(id) ON DELETE CASCADE
);

-- Insert initial data for Office 365 page
INSERT INTO product_view_pages (slug, title, subtitle, hero_description) 
VALUES (
    'microsoft-office-365',
    'Get started with Microsoft Office 365 today',
    'Collaborate, create, and achieve more with the world''s leading productivity suite.',
    'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.'
); 