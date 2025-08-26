-- Insert sample Microsoft products
-- First, ensure Microsoft brand exists
INSERT IGNORE INTO brands (name, logo_url, description, is_active, position) VALUES
('Microsoft', '/images/brands/microsoft-logo.png', 'Leading technology company specializing in software, services, and solutions.', true, 1);

-- Get the Microsoft brand ID
SET @microsoft_brand_id = (SELECT id FROM brands WHERE name = 'Microsoft' LIMIT 1);

-- Insert sample Microsoft products
INSERT INTO products (brand_id, name, description, image_url, price, primary_button_text, secondary_button_text, is_active, position) VALUES
(@microsoft_brand_id, 'Microsoft 365 Business Basic', 'Essential productivity and collaboration tools for small businesses', '/images/products/m365-basic.png', 6.00, 'Get Started', 'Free Trial', true, 1),
(@microsoft_brand_id, 'Microsoft 365 Business Standard', 'Complete productivity and collaboration solution for growing businesses', '/images/products/m365-standard.png', 12.50, 'Get Started', 'Free Trial', true, 2),
(@microsoft_brand_id, 'Microsoft 365 Business Premium', 'Advanced security and device management for businesses', '/images/products/m365-premium.png', 22.00, 'Get Started', 'Free Trial', true, 3),
(@microsoft_brand_id, 'Microsoft 365 Apps for Business', 'Office apps for business with cloud storage', '/images/products/m365-apps.png', 8.25, 'Get Started', 'Free Trial', true, 4),
(@microsoft_brand_id, 'Microsoft Teams', 'Chat, meet, call, and collaborate all in one place', '/images/products/teams.png', 4.00, 'Get Started', 'Free Trial', true, 5);
