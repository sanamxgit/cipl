<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

class ImageGrid {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllImages() {
        try {
            $query = "SELECT * FROM image_grid ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function updateImage($id, $data) {
        try {
            $query = "UPDATE image_grid SET 
                    title = :title,
                    description = :description,
                    image_url = :image_url,
                    is_active = :is_active
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function addImage($data) {
        try {
            // Validate required fields
            if (!isset($data['title']) || empty($data['title'])) {
                throw new Exception('Title is required');
            }
            if (!isset($data['image_url']) || empty($data['image_url'])) {
                throw new Exception('Image URL is required');
            }

            $query = "INSERT INTO image_grid (title, description, image_url, is_active) 
                     VALUES (:title, :description, :image_url, :is_active)";
            
            $stmt = $this->conn->prepare($query);
            
            // Set default values for optional fields
            $description = isset($data['description']) ? $data['description'] : '';
            $isActive = isset($data['is_active']) ? $data['is_active'] : true;
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':is_active', $isActive, PDO::PARAM_BOOL);
            
            if (!$stmt->execute()) {
                throw new Exception('Database error: ' . implode(', ', $stmt->errorInfo()));
            }
            
            return true;
        } catch (PDOException $e) {
            throw new Exception('Database error: ' . $e->getMessage());
        }
    }

    public function deleteImage($id) {
        try {
            $query = "DELETE FROM image_grid WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$imageGrid = new ImageGrid($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $result = $imageGrid->getAllImages();
            echo json_encode([
                'status' => 'success',
                'data' => $result
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if ($id) {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                if($imageGrid->updateImage($id, $data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Image updated successfully'
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if($imageGrid->addImage($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Image added successfully'
                ]);
            } else {
                throw new Exception('Failed to add image');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if($id) {
            try {
                if($imageGrid->deleteImage($id)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Image deleted successfully'
                    ]);
                } else {
                    throw new Exception('Failed to delete image');
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
        break;
}
?> 