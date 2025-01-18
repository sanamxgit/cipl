CREATE TABLE quotations (
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