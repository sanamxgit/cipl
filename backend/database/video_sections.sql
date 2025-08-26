CREATE TABLE IF NOT EXISTS video_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    video_url VARCHAR(255) NOT NULL,
    poster_image VARCHAR(255),
    button_text VARCHAR(100) DEFAULT 'Add to Cart',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO video_sections (title, subtitle, video_url, poster_image, button_text) VALUES
('Discover Our Latest Products', 'Watch how our innovative solutions can transform your business', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/images/video-poster.jpg', 'Learn More'); 