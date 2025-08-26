-- Create quotations table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    country VARCHAR(255),
    product_type VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    message TEXT,
    status ENUM('pending', 'contacted', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record to verify the table works
INSERT IGNORE INTO quotations (full_name, email, phone_number, company_name, country, product_type, product_name, message, status) VALUES
('Test User', 'test@example.com', '1234567890', 'Test Company', 'USA', 'Software', 'Test Product', 'Test message', 'pending');
