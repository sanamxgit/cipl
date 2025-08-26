<?php
// Load CORS helper if present; otherwise set minimal CORS headers inline
if (file_exists(__DIR__ . '/cors.php')) {
    require_once __DIR__ . '/cors.php';
    setCorsHeaders();
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../config/database.php';

class VideoSection {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getVideoData() {
        try {
            $query = "SELECT * FROM video_sections LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // If no data exists, create default data
            if (!$result) {
                $result = $this->createDefaultVideoData();
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return null;
        }
    }

    public function createDefaultVideoData() {
        try {
            $query = "INSERT INTO video_sections (title, subtitle, video_url, poster_image, button_text) 
                     VALUES (:title, :subtitle, :video_url, :poster_image, :button_text)";
            
            $stmt = $this->conn->prepare($query);
            
            $title = 'Discover Our Latest Products';
            $subtitle = 'Watch how our innovative solutions can transform your business';
            $video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            $poster_image = '/images/video-poster.jpg';
            $button_text = 'Learn More';
            
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':subtitle', $subtitle);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':poster_image', $poster_image);
            $stmt->bindParam(':button_text', $button_text);
            
            if ($stmt->execute()) {
                return [
                    'id' => $this->conn->lastInsertId(),
                    'title' => $title,
                    'subtitle' => $subtitle,
                    'video_url' => $video_url,
                    'poster_image' => $poster_image,
                    'button_text' => $button_text
                ];
            }
            
            return null;
        } catch (PDOException $e) {
            error_log("Error creating default video data: " . $e->getMessage());
            return null;
        }
    }

    public function createVideoData($data) {
        try {
            $query = "INSERT INTO video_sections (title, subtitle, video_url, poster_image, button_text) 
                     VALUES (:title, :subtitle, :video_url, :poster_image, :button_text)";
            
            $stmt = $this->conn->prepare($query);
            
            // Convert null values to empty strings
            $title = $data['title'] ?? '';
            $subtitle = $data['subtitle'] ?? '';
            $video_url = $data['videoUrl'] ?? '';
            $poster_image = $data['posterImage'] ?? '';
            $button_text = $data['buttonText'] ?? 'Add to Cart';
            
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':subtitle', $subtitle);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':poster_image', $poster_image);
            $stmt->bindParam(':button_text', $button_text);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error creating video data: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateVideoData($data) {
        try {
            error_log("Updating video data: " . print_r($data, true));

            // Validate required fields
            if (!isset($data['id'])) {
                throw new Exception('Missing ID');
            }

            $query = "UPDATE video_sections SET 
                    title = :title,
                    subtitle = :subtitle,
                    video_url = :videoUrl,
                    poster_image = :posterImage,
                    button_text = :buttonText
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            // Convert null values to empty strings
            $title = $data['title'] ?? '';
            $subtitle = $data['subtitle'] ?? '';
            $videoUrl = $data['videoUrl'] ?? '';
            $posterImage = $data['posterImage'] ?? '';
            $buttonText = $data['buttonText'] ?? 'Add to Cart';
            
            $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':subtitle', $subtitle);
            $stmt->bindParam(':videoUrl', $videoUrl);
            $stmt->bindParam(':posterImage', $posterImage);
            $stmt->bindParam(':buttonText', $buttonText);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Update failed: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Database update failed: " . implode(", ", $stmt->errorInfo()));
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in updateVideoData: " . $e->getMessage());
            throw $e;
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$videoSection = new VideoSection($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $result = $videoSection->getVideoData();
            if ($result) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } else {
                // Return empty data instead of throwing an error
                echo json_encode([
                    'status' => 'success',
                    'data' => null,
                    'message' => 'No video section data found'
                ]);
            }
        } catch (Exception $e) {
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
            
            // Log received data
            error_log("Received PUT data: " . print_r($data, true));
            
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            if ($videoSection->updateVideoData($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Video section updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update video section');
            }
        } catch (Exception $e) {
            error_log("Error updating video section: " . $e->getMessage());
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
            
            // Check if video section already exists
            $existing = $videoSection->getVideoData();
            if ($existing) {
                // Update existing record
                $data['id'] = $existing['id'];
                if ($videoSection->updateVideoData($data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Video section updated successfully'
                    ]);
                } else {
                    throw new Exception('Failed to update video section');
                }
            } else {
                // Create new record
                if ($videoSection->createVideoData($data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Video section created successfully'
                    ]);
                } else {
                    throw new Exception('Failed to create video section');
                }
            }
        } catch (Exception $e) {
            error_log("Error in POST video section: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
}
?> 