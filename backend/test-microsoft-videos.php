<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h2>Microsoft Videos Database Test</h2>";
    
    // Check if table exists
    $tableQuery = "SHOW TABLES LIKE 'microsoft_videos'";
    $tableStmt = $db->prepare($tableQuery);
    $tableStmt->execute();
    $tableExists = $tableStmt->rowCount() > 0;
    
    echo "<p><strong>Table exists:</strong> " . ($tableExists ? "YES" : "NO") . "</p>";
    
    if ($tableExists) {
        // Check table structure
        $structureQuery = "DESCRIBE microsoft_videos";
        $structureStmt = $db->prepare($structureQuery);
        $structureStmt->execute();
        $structure = $structureStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p><strong>Table structure:</strong></p>";
        echo "<ul>";
        foreach ($structure as $column) {
            echo "<li>{$column['Field']} - {$column['Type']}</li>";
        }
        echo "</ul>";
        
        // Check if data exists
        $countQuery = "SELECT COUNT(*) as count FROM microsoft_videos";
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute();
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo "<p><strong>Number of videos:</strong> {$count}</p>";
        
        if ($count > 0) {
            // Show existing data
            $dataQuery = "SELECT * FROM microsoft_videos";
            $dataStmt = $db->prepare($dataQuery);
            $dataStmt->execute();
            $videos = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<p><strong>Existing videos:</strong></p>";
            echo "<ul>";
            foreach ($videos as $video) {
                echo "<li>ID: {$video['id']} - Title: {$video['title']} - Active: {$video['is_active']} - Thumbnail: {$video['thumbnail_url']}</li>";
            }
            echo "</ul>";
        } else {
            // Insert sample data
            echo "<p><strong>No data found. Inserting sample data...</strong></p>";
            
            $insertQuery = "INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order, is_active) 
                           VALUES (:title, :description, :video_url, :thumbnail_url, :sort_order, :is_active)";
            
            $insertStmt = $db->prepare($insertQuery);
            
            $sampleData = [
                'title' => 'Microsoft 365 Overview',
                'description' => 'Discover the power of Microsoft 365 for productivity and collaboration',
                'video_url' => 'https://www.youtube.com/embed/Ba7zone0Xk0',
                'thumbnail_url' => '/images/microsoft-video-thumbnail.jpg',
                'sort_order' => 1,
                'is_active' => 1
            ];
            
            $insertStmt->bindParam(':title', $sampleData['title']);
            $insertStmt->bindParam(':description', $sampleData['description']);
            $insertStmt->bindParam(':video_url', $sampleData['video_url']);
            $insertStmt->bindParam(':thumbnail_url', $sampleData['thumbnail_url']);
            $insertStmt->bindParam(':sort_order', $sampleData['sort_order']);
            $insertStmt->bindParam(':is_active', $sampleData['is_active']);
            
            if ($insertStmt->execute()) {
                echo "<p style='color: green;'><strong>Sample data inserted successfully!</strong></p>";
                echo "<p>ID: " . $db->lastInsertId() . "</p>";
            } else {
                echo "<p style='color: red;'><strong>Failed to insert sample data</strong></p>";
            }
        }
    } else {
        // Create table
        echo "<p><strong>Creating microsoft_videos table...</strong></p>";
        
        $createTableQuery = "
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
        )";
        
        $createStmt = $db->prepare($createTableQuery);
        if ($createStmt->execute()) {
            echo "<p style='color: green;'><strong>Table created successfully!</strong></p>";
            
            // Insert sample data
            $insertQuery = "INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order, is_active) 
                           VALUES (:title, :description, :video_url, :thumbnail_url, :sort_order, :is_active)";
            
            $insertStmt = $db->prepare($insertQuery);
            
            $sampleData = [
                'title' => 'Microsoft 365 Overview',
                'description' => 'Discover the power of Microsoft 365 for productivity and collaboration',
                'video_url' => 'https://www.youtube.com/embed/Ba7zone0Xk0',
                'thumbnail_url' => '/images/microsoft-video-thumbnail.jpg',
                'sort_order' => 1,
                'is_active' => 1
            ];
            
            $insertStmt->bindParam(':title', $sampleData['title']);
            $insertStmt->bindParam(':description', $sampleData['description']);
            $insertStmt->bindParam(':video_url', $sampleData['video_url']);
            $insertStmt->bindParam(':thumbnail_url', $sampleData['thumbnail_url']);
            $insertStmt->bindParam(':sort_order', $sampleData['sort_order']);
            $insertStmt->bindParam(':is_active', $sampleData['is_active']);
            
            if ($insertStmt->execute()) {
                echo "<p style='color: green;'><strong>Sample data inserted successfully!</strong></p>";
            } else {
                echo "<p style='color: red;'><strong>Failed to insert sample data</strong></p>";
            }
        } else {
            echo "<p style='color: red;'><strong>Failed to create table</strong></p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>Error:</strong> " . $e->getMessage() . "</p>";
}
?>
