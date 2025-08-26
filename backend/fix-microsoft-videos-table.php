<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h2>Fixing Microsoft Videos Table</h2>";
    
    // Add is_active column if it doesn't exist
    $checkColumnQuery = "SHOW COLUMNS FROM microsoft_videos LIKE 'is_active'";
    $checkColumnStmt = $db->prepare($checkColumnQuery);
    $checkColumnStmt->execute();
    $columnExists = $checkColumnStmt->rowCount() > 0;
    
    if (!$columnExists) {
        echo "<p><strong>Adding is_active column...</strong></p>";
        $addColumnQuery = "ALTER TABLE microsoft_videos ADD COLUMN is_active BOOLEAN DEFAULT true";
        $addColumnStmt = $db->prepare($addColumnQuery);
        if ($addColumnStmt->execute()) {
            echo "<p style='color: green;'>✓ is_active column added successfully</p>";
        } else {
            echo "<p style='color: red;'>✗ Failed to add is_active column</p>";
        }
    } else {
        echo "<p>✓ is_active column already exists</p>";
    }
    
    // Update existing data
    echo "<p><strong>Updating existing data...</strong></p>";
    
    // Set is_active to 1 for existing records
    $updateActiveQuery = "UPDATE microsoft_videos SET is_active = 1 WHERE is_active IS NULL OR is_active = 0";
    $updateActiveStmt = $db->prepare($updateActiveQuery);
    if ($updateActiveStmt->execute()) {
        echo "<p style='color: green;'>✓ Set is_active = 1 for existing records</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to update is_active</p>";
    }
    
    // Update thumbnail_url if empty
    $updateThumbnailQuery = "UPDATE microsoft_videos SET thumbnail_url = '/images/microsoft-video-thumbnail.jpg' WHERE thumbnail_url = '' OR thumbnail_url IS NULL";
    $updateThumbnailStmt = $db->prepare($updateThumbnailQuery);
    if ($updateThumbnailStmt->execute()) {
        echo "<p style='color: green;'>✓ Updated empty thumbnail_url</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to update thumbnail_url</p>";
    }
    
    // Convert YouTube URLs to embed format
    $updateVideoQuery = "UPDATE microsoft_videos SET video_url = REPLACE(video_url, 'youtube.com/watch?v=', 'youtube.com/embed/') WHERE video_url LIKE '%youtube.com/watch?v=%'";
    $updateVideoStmt = $db->prepare($updateVideoQuery);
    if ($updateVideoStmt->execute()) {
        echo "<p style='color: green;'>✓ Converted YouTube URLs to embed format</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to update video URLs</p>";
    }
    
    // Show final data
    echo "<p><strong>Final data:</strong></p>";
    $selectQuery = "SELECT * FROM microsoft_videos";
    $selectStmt = $db->prepare($selectQuery);
    $selectStmt->execute();
    $videos = $selectStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<ul>";
    foreach ($videos as $video) {
        echo "<li>ID: {$video['id']} - Title: {$video['title']} - Active: {$video['is_active']} - Thumbnail: {$video['thumbnail_url']} - Video: {$video['video_url']}</li>";
    }
    echo "</ul>";
    
    echo "<p style='color: green;'><strong>Table fixed successfully!</strong></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>Error:</strong> " . $e->getMessage() . "</p>";
}
?>
