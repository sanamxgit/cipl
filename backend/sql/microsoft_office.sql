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

CREATE TABLE microsoft_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 