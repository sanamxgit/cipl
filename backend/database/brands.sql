-- Table for brands
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for brands
INSERT INTO brands (name, logo_url, description, is_active, position) VALUES
('Microsoft', '/images/brands/microsoft-logo.png', 'Leading technology company specializing in software, services, and solutions.', true, 1),
('Autodesk', '/images/brands/autodesk-logo.png', 'Global leader in 3D design, engineering, and entertainment software.', true, 2),
('Adobe', '/images/brands/adobe-logo.png', 'Creativity and digital media software company.', true, 3),
('Oracle', '/images/brands/oracle-logo.png', 'Enterprise software and cloud computing company.', true, 4),
('SAP', '/images/brands/sap-logo.png', 'Enterprise application software company.', true, 5);
