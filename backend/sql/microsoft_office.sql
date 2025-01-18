DROP TABLE IF EXISTS microsoft_office_page;
CREATE TABLE microsoft_office_page (
    id INT PRIMARY KEY DEFAULT 1,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    banner_image VARCHAR(255),
    is_image_url BOOLEAN DEFAULT FALSE,
    main_heading TEXT NOT NULL,
    main_description TEXT NOT NULL,
    floating_icons JSON DEFAULT '[]',
    plans JSON DEFAULT '{"home":{"title":"For Home","cards":[]},"business":{"title":"For Business","cards":[]}}',
    microsoft_logo VARCHAR(255) DEFAULT '/images/microsoft-logo.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

ALTER TABLE microsoft_office_page
ADD COLUMN microsoft_logo VARCHAR(255) DEFAULT '/path/to/microsoft-logo.png',
ADD COLUMN partner_logo VARCHAR(255); 

ALTER TABLE microsoft_office_page 
ADD COLUMN IF NOT EXISTS video_title VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS video_description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS video_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS video_thumbnail_url VARCHAR(255) DEFAULT NULL;

-- Drop the microsoft_videos table since we're not using it anymore
DROP TABLE IF EXISTS microsoft_videos; 

-- Run this query to check the video data
SELECT video_url, video_title, video_description, video_thumbnail_url 
FROM microsoft_office_page 
WHERE id = 1; 