<?php
// Load CORS helper if present; otherwise set minimal CORS headers inline
if (file_exists(__DIR__ . '/cors.php')) {
    require_once __DIR__ . '/cors.php';
    setCorsHeaders();
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
    header('Content-Type: application/json; charset=UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../config/database.php';

class MicrosoftVideoSection {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getVideoData() {
        try {
            // Check if is_active column exists
            $checkColumnQuery = "SHOW COLUMNS FROM microsoft_videos LIKE 'is_active'";
            $checkColumnStmt = $this->conn->prepare($checkColumnQuery);
            $checkColumnStmt->execute();
            $hasIsActiveColumn = $checkColumnStmt->rowCount() > 0;
            
            if ($hasIsActiveColumn) {
                // Use is_active column if it exists
                $query = "SELECT * FROM microsoft_videos WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 1";
                $stmt = $this->conn->prepare($query);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // If no active videos found, get any video and fix it
                if (!$result) {
                    $query = "SELECT * FROM microsoft_videos ORDER BY sort_order ASC LIMIT 1";
                    $stmt = $this->conn->prepare($query);
                    $stmt->execute();
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    // If we found a video but it has issues, fix them automatically
                    if ($result) {
                        error_log("Found video with ID: " . $result['id'] . ", fixing data issues...");
                        $this->fixVideoData($result['id']);
                        
                        // Get the fixed data
                        $query = "SELECT * FROM microsoft_videos WHERE id = ?";
                        $stmt = $this->conn->prepare($query);
                        $stmt->execute([$result['id']]);
                        $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    }
                }
            } else {
                // No is_active column, just get the first video
                $query = "SELECT * FROM microsoft_videos ORDER BY sort_order ASC LIMIT 1";
                $stmt = $this->conn->prepare($query);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // If we found a video, fix any issues
                if ($result) {
                    error_log("Found video with ID: " . $result['id'] . ", fixing data issues...");
                    $this->fixVideoData($result['id']);
                    
                    // Get the fixed data
                    $query = "SELECT * FROM microsoft_videos WHERE id = ?";
                    $stmt = $this->conn->prepare($query);
                    $stmt->execute([$result['id']]);
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                }
            }
            
            // If still no data exists, create default data
            if (!$result) {
                error_log("No videos found in database, creating default");
                $result = $this->createDefaultVideoData();
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in getVideoData: " . $e->getMessage());
            return null;
        }
    }

    private function fixVideoData($videoId) {
        try {
            // Check if is_active column exists
            $checkColumnQuery = "SHOW COLUMNS FROM microsoft_videos LIKE 'is_active'";
            $checkColumnStmt = $this->conn->prepare($checkColumnQuery);
            $checkColumnStmt->execute();
            $hasIsActiveColumn = $checkColumnStmt->rowCount() > 0;
            
            // Fix thumbnail_url if it's empty or just "0"
            $updateThumbnailSql = "
            UPDATE microsoft_videos 
            SET thumbnail_url = '/images/microsoft-video-thumbnail.jpg'
            WHERE id = ? AND (thumbnail_url = '' OR thumbnail_url = '0' OR thumbnail_url IS NULL)
            ";
            
            $stmt = $this->conn->prepare($updateThumbnailSql);
            $stmt->execute([$videoId]);
            
            // Convert YouTube URLs to embed format
            $updateVideoSql = "
            UPDATE microsoft_videos 
            SET video_url = REPLACE(video_url, 'youtube.com/watch?v=', 'youtube.com/embed/')
            WHERE id = ? AND video_url LIKE '%youtube.com/watch?v=%'
            ";
            
            $stmt = $this->conn->prepare($updateVideoSql);
            $stmt->execute([$videoId]);
            
            // Set is_active to 1 only if the column exists
            if ($hasIsActiveColumn) {
                $updateActiveSql = "
                UPDATE microsoft_videos 
                SET is_active = 1
                WHERE id = ? AND (is_active = 0 OR is_active IS NULL)
                ";
                
                $stmt = $this->conn->prepare($updateActiveSql);
                $stmt->execute([$videoId]);
            }
            
            error_log("Video data fixed for ID: " . $videoId);
            
        } catch (PDOException $e) {
            error_log("Error fixing video data: " . $e->getMessage());
        }
    }

    public function createDefaultVideoData() {
        try {
            $query = "INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order) 
                     VALUES (:title, :description, :video_url, :thumbnail_url, :sort_order)";
            
            $stmt = $this->conn->prepare($query);
            
            $title = 'Microsoft 365 Overview';
            $description = 'Discover the power of Microsoft 365 for productivity and collaboration';
            $video_url = 'https://www.youtube.com/embed/Ba7zone0Xk0';
            $thumbnail_url = '/images/microsoft-video-thumbnail.jpg';
            $sort_order = 1;
            
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':thumbnail_url', $thumbnail_url);
            $stmt->bindParam(':sort_order', $sort_order);
            
            if ($stmt->execute()) {
                return [
                    'id' => $this->conn->lastInsertId(),
                    'title' => $title,
                    'description' => $description,
                    'video_url' => $video_url,
                    'thumbnail_url' => $thumbnail_url,
                    'sort_order' => $sort_order
                ];
            }
            
            return null;
        } catch (PDOException $e) {
            error_log("Error creating default Microsoft video data: " . $e->getMessage());
            return null;
        }
    }

    public function getAllVideos() {
        try {
            $query = "SELECT * FROM microsoft_videos ORDER BY sort_order ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function createVideoData($data) {
        try {
            // Check if is_active column exists
            $checkColumnQuery = "SHOW COLUMNS FROM microsoft_videos LIKE 'is_active'";
            $checkColumnStmt = $this->conn->prepare($checkColumnQuery);
            $checkColumnStmt->execute();
            $hasIsActiveColumn = $checkColumnStmt->rowCount() > 0;
            
            if ($hasIsActiveColumn) {
                $query = "INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order, is_active) 
                         VALUES (:title, :description, :video_url, :thumbnail_url, :sort_order, :is_active)";
            } else {
                $query = "INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order) 
                         VALUES (:title, :description, :video_url, :thumbnail_url, :sort_order)";
            }
            
            $stmt = $this->conn->prepare($query);
            
            $title = $data['title'] ?? '';
            $description = $data['description'] ?? '';
            $video_url = $data['video_url'] ?? '';
            $thumbnail_url = $data['thumbnail_url'] ?? '';
            $sort_order = (int)($data['sort_order'] ?? 0);
            
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':thumbnail_url', $thumbnail_url);
            $stmt->bindParam(':sort_order', $sort_order);
            
            if ($hasIsActiveColumn) {
                $is_active = 1;
                $stmt->bindParam(':is_active', $is_active);
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error creating Microsoft video data: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateVideoData($data) {
        try {
            if (!isset($data['id'])) {
                throw new Exception('Missing ID');
            }

            $query = "UPDATE microsoft_videos SET 
                    title = :title,
                    description = :description,
                    video_url = :video_url,
                    thumbnail_url = :thumbnail_url,
                    sort_order = :sort_order
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $title = $data['title'] ?? '';
            $description = $data['description'] ?? '';
            $video_url = $data['video_url'] ?? '';
            $thumbnail_url = $data['thumbnail_url'] ?? '';
            $sort_order = (int)($data['sort_order'] ?? 0);
            
            $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':thumbnail_url', $thumbnail_url);
            $stmt->bindParam(':sort_order', $sort_order);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error in updateVideoData: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteVideoData($id) {
        try {
            $query = "DELETE FROM microsoft_videos WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error in deleteVideoData: " . $e->getMessage());
            throw $e;
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$microsoftVideoSection = new MicrosoftVideoSection($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            // Debug: Check what's in the database
            error_log("GET request received, checking database...");
            
            // First, let's see what's actually in the database
            try {
                $debugQuery = "SELECT COUNT(*) as count FROM microsoft_videos";
                $debugStmt = $db->prepare($debugQuery);
                $debugStmt->execute();
                $count = $debugStmt->fetch(PDO::FETCH_ASSOC)['count'];
                error_log("Database has " . $count . " videos");
                
                if ($count > 0) {
                    $debugQuery2 = "SELECT id, title, is_active FROM microsoft_videos LIMIT 3";
                    $debugStmt2 = $db->prepare($debugQuery2);
                    $debugStmt2->execute();
                    $debugVideos = $debugStmt2->fetchAll(PDO::FETCH_ASSOC);
                    error_log("Sample videos: " . json_encode($debugVideos));
                }
            } catch (Exception $e) {
                error_log("Debug query failed: " . $e->getMessage());
            }
            
            $result = $microsoftVideoSection->getVideoData();
            error_log("getVideoData returned: " . ($result ? "Data found" : "No data"));
            
            if ($result) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } else {
                echo json_encode([
                    'status' => 'success',
                    'data' => null,
                    'message' => 'No Microsoft video data found'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error in GET request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            if ($microsoftVideoSection->updateVideoData($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Microsoft video updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update Microsoft video');
            }
        } catch (Exception $e) {
            error_log("Error updating Microsoft video: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            if ($microsoftVideoSection->createVideoData($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Microsoft video created successfully'
                ]);
            } else {
                throw new Exception('Failed to create Microsoft video');
            }
        } catch (Exception $e) {
            error_log("Error in POST Microsoft video: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'DELETE':
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!isset($data['id'])) {
                throw new Exception('Video ID is required');
            }
            
            if ($microsoftVideoSection->deleteVideoData($data['id'])) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Microsoft video deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete Microsoft video');
            }
        } catch (Exception $e) {
            error_log("Error deleting Microsoft video: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
}
?>
