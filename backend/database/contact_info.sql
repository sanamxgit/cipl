-- Contact Information Table
CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL DEFAULT '+977-980000000',
    email VARCHAR(255) NOT NULL DEFAULT 'service@cipl.com',
    chat_title VARCHAR(255) NOT NULL DEFAULT 'Chat Now',
    chat_description TEXT NOT NULL DEFAULT 'Chat with our support team for quick answers on product features, pricing and more.',
    call_title VARCHAR(255) NOT NULL DEFAULT 'Call Us',
    call_description VARCHAR(255) NOT NULL DEFAULT 'Call Our Award Winning Support 24/7',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default contact information
INSERT INTO contact_info (phone_number, email, chat_title, chat_description, call_title, call_description) 
VALUES (
    '+977-980000000',
    'service@cipl.com',
    'Chat Now',
    'Chat with our support team for quick answers on product features, pricing and more.',
    'Call Us',
    'Call Our Award Winning Support 24/7'
) ON DUPLICATE KEY UPDATE id = id;
