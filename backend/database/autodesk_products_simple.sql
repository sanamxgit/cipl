-- Insert sample Autodesk products (simplified - no categories)
-- First, ensure Autodesk brand exists
INSERT IGNORE INTO brands (name, logo_url, description, is_active, position) VALUES
('Autodesk', '/images/brands/autodesk-logo.png', 'Global leader in 3D design, engineering, and entertainment software.', true, 2);

-- Get the Autodesk brand ID
SET @autodesk_brand_id = (SELECT id FROM brands WHERE name = 'Autodesk' LIMIT 1);

-- Insert sample Autodesk products
INSERT IGNORE INTO products (brand_id, name, description, image_url, price, primary_button_text, secondary_button_text, is_active, position) VALUES
(@autodesk_brand_id, 'AutoCAD', 'Professional 2D and 3D design software for architects, engineers, and construction professionals', '/images/products/autocad.png', 235.00, 'Get Started', 'Free Trial', true, 1),
(@autodesk_brand_id, 'Revit', 'Building information modeling software for architects, structural engineers, and MEP engineers', '/images/products/revit.png', 335.00, 'Get Started', 'Free Trial', true, 2),
(@autodesk_brand_id, '3ds Max', '3D modeling, animation, and rendering software for design visualization, games, and visual effects', '/images/products/3dsmax.png', 215.00, 'Get Started', 'Free Trial', true, 3),
(@autodesk_brand_id, 'Maya', '3D computer animation, modeling, simulation, and rendering software', '/images/products/maya.png', 225.00, 'Get Started', 'Free Trial', true, 4),
(@autodesk_brand_id, 'Fusion 360', 'Cloud-based 3D CAD, CAM, and CAE platform for product development', '/images/products/fusion360.png', 60.00, 'Get Started', 'Free Trial', true, 5),
(@autodesk_brand_id, 'Inventor', 'Professional 3D mechanical design, documentation, and product simulation software', '/images/products/inventor.png', 245.00, 'Get Started', 'Free Trial', true, 6),
(@autodesk_brand_id, 'Civil 3D', 'Civil engineering design and documentation software', '/images/products/civil3d.png', 255.00, 'Get Started', 'Free Trial', true, 7),
(@autodesk_brand_id, 'Navisworks', 'Project review software for coordination, analysis, and communication', '/images/products/navisworks.png', 115.00, 'Get Started', 'Free Trial', true, 8);
