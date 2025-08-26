-- Assign Autodesk products to categories
-- First, ensure we have the Autodesk brand and products
INSERT IGNORE INTO brands (name, logo_url, description, is_active, position) VALUES
('Autodesk', '/images/brands/autodesk-logo.png', 'Global leader in 3D design, engineering, and entertainment software.', true, 2);

-- Get the Autodesk brand ID
SET @autodesk_brand_id = (SELECT id FROM brands WHERE name = 'Autodesk' LIMIT 1);

-- Insert sample Autodesk products if they don't exist
INSERT IGNORE INTO products (brand_id, name, description, image_url, price, primary_button_text, secondary_button_text, is_active, position) VALUES
(@autodesk_brand_id, 'AutoCAD', 'Professional 2D and 3D design software for architects, engineers, and construction professionals', '/images/products/autocad.png', 235.00, 'Get Started', 'Free Trial', true, 1),
(@autodesk_brand_id, 'Revit', 'Building information modeling software for architects, structural engineers, and MEP engineers', '/images/products/revit.png', 335.00, 'Get Started', 'Free Trial', true, 2),
(@autodesk_brand_id, '3ds Max', '3D modeling, animation, and rendering software for design visualization, games, and visual effects', '/images/products/3dsmax.png', 215.00, 'Get Started', 'Free Trial', true, 3),
(@autodesk_brand_id, 'Maya', '3D computer animation, modeling, simulation, and rendering software', '/images/products/maya.png', 225.00, 'Get Started', 'Free Trial', true, 4),
(@autodesk_brand_id, 'Fusion 360', 'Cloud-based 3D CAD, CAM, and CAE platform for product development', '/images/products/fusion360.png', 60.00, 'Get Started', 'Free Trial', true, 5),
(@autodesk_brand_id, 'Inventor', 'Professional 3D mechanical design, documentation, and product simulation software', '/images/products/inventor.png', 245.00, 'Get Started', 'Free Trial', true, 6),
(@autodesk_brand_id, 'Civil 3D', 'Civil engineering design and documentation software', '/images/products/civil3d.png', 255.00, 'Get Started', 'Free Trial', true, 7),
(@autodesk_brand_id, 'Navisworks', 'Project review software for coordination, analysis, and communication', '/images/products/navisworks.png', 115.00, 'Get Started', 'Free Trial', true, 8);

-- Get product IDs
SET @autocad_id = (SELECT id FROM products WHERE name = 'AutoCAD' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @revit_id = (SELECT id FROM products WHERE name = 'Revit' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @civil3d_id = (SELECT id FROM products WHERE name = 'Civil 3D' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @navisworks_id = (SELECT id FROM products WHERE name = 'Navisworks' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @fusion360_id = (SELECT id FROM products WHERE name = 'Fusion 360' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @inventor_id = (SELECT id FROM products WHERE name = 'Inventor' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @3dsmax_id = (SELECT id FROM products WHERE name = '3ds Max' AND brand_id = @autodesk_brand_id LIMIT 1);
SET @maya_id = (SELECT id FROM products WHERE name = 'Maya' AND brand_id = @autodesk_brand_id LIMIT 1);

-- Get category IDs
SET @aec_category_id = (SELECT id FROM autodesk_categories WHERE name = 'Architecture, Engineering & Construction' LIMIT 1);
SET @pdm_category_id = (SELECT id FROM autodesk_categories WHERE name = 'Product Design & Manufacturing' LIMIT 1);
SET @me_category_id = (SELECT id FROM autodesk_categories WHERE name = 'Media & Entertainment' LIMIT 1);

-- Assign products to categories
-- Architecture, Engineering & Construction
INSERT IGNORE INTO product_categories (product_id, category_id) VALUES
(@autocad_id, @aec_category_id),
(@revit_id, @aec_category_id),
(@civil3d_id, @aec_category_id),
(@navisworks_id, @aec_category_id);

-- Product Design & Manufacturing
INSERT IGNORE INTO product_categories (product_id, category_id) VALUES
(@autocad_id, @pdm_category_id),
(@fusion360_id, @pdm_category_id),
(@inventor_id, @pdm_category_id);

-- Media & Entertainment
INSERT IGNORE INTO product_categories (product_id, category_id) VALUES
(@3dsmax_id, @me_category_id),
(@maya_id, @me_category_id);
