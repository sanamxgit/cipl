<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        die("Database connection failed\n");
    }
    
    echo "Database connected successfully\n";
    
    // Update existing YouTube URLs to embed format
    $updateSql = "
    UPDATE microsoft_videos 
    SET video_url = REPLACE(video_url, 'youtube.com/watch?v=', 'youtube.com/embed/')
    WHERE video_url LIKE '%youtube.com/watch?v=%'
    ";
    
    $stmt = $conn->prepare($updateSql);
    $result = $stmt->execute();
    
    if ($result) {
        echo "YouTube URLs updated to embed format successfully\n";
        
        // Show the updated data
        $selectSql = "SELECT * FROM microsoft_videos";
        $stmt = $conn->prepare($selectSql);
        $stmt->execute();
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nUpdated video data:\n";
        foreach ($videos as $video) {
            echo "ID: {$video['id']}\n";
            echo "Title: {$video['title']}\n";
            echo "Video URL: {$video['video_url']}\n";
            echo "---\n";
        }
    } else {
        echo "Failed to update YouTube URLs\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
