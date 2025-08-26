-- Microsoft Videos Table
-- This table stores video information for the Microsoft Office page

CREATE TABLE IF NOT EXISTS microsoft_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order) VALUES
('Microsoft 365 Overview', 'Discover the power of Microsoft 365 for productivity and collaboration', 'https://www.youtube.com/embed/Ba7zone0Xk0', '/images/microsoft-video-thumbnail.jpg', 1),
('Office Apps Demo', 'See how Office apps work together seamlessly', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/images/office-demo-thumbnail.jpg', 2);
