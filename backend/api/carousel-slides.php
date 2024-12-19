<?php
// Clear any existing headers
if (function_exists('header_remove')) {
    header_remove();
}

// Set headers once
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Make sure no other code is setting headers
ob_start();

require_once '../config/database.php';

class CarouselSlides {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getSlides() {
        try {
            $query = "SELECT * FROM carousel_slides ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Transform the data to match frontend expectations
            return array_map(function($slide) {
                if (isset($slide['product_card']) && !empty($slide['product_card'])) {
                    $slide['product_card'] = json_decode($slide['product_card'], true);
                }
                return $slide;
            }, $result);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function addSlide($data) {
        $query = "INSERT INTO carousel_slides 
                 (title, description, image_url, product_card)
                 VALUES (:title, :description, :image_url, :product_card)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':image_url', $data['image_url']);
        $stmt->bindParam(':product_card', json_encode($data['product_card']));
        
        return $stmt->execute();
    }

    public function deleteSlide($id) {
        $query = "DELETE FROM carousel_slides WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function updateSlide($id, $data) {
        try {
            // Log the update attempt
            error_log("Attempting to update slide: " . print_r([
                'id' => $id,
                'data' => $data
            ], true));

            $query = "UPDATE carousel_slides SET 
                    title = :title, 
                    description = :description, 
                    image_url = :image_url, 
                    product_card = :product_card 
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $product_card = json_encode($data['product_card']);
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':product_card', $product_card);
            $stmt->bindParam(':id', $id);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Update failed: " . print_r($stmt->errorInfo(), true));
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error during update: " . $e->getMessage());
            throw $e;
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$carouselSlides = new CarouselSlides($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $slides = $carouselSlides->getSlides();
            echo json_encode([
                'status' => 'success',
                'data' => $slides
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch slides',
                'error' => $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if($carouselSlides->addSlide($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Slide created successfully'
                ]);
            } else {
                throw new Exception('Failed to create slide');
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
        if($id && $carouselSlides->deleteSlide($id)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Slide deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete slide'
            ]);
        }
        break;
        
    case 'PUT':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if ($id) {
            try {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                // Log the received data
                error_log("Received PUT data: " . print_r([
                    'id' => $id,
                    'input' => $input,
                    'decoded' => $data
                ], true));
                
                if (!$data) {
                    throw new Exception('Invalid JSON data received');
                }
                
                $result = $carouselSlides->updateSlide($id, $data);
                
                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Slide updated successfully',
                        'data' => $data
                    ]);
                } else {
                    throw new Exception('Database update failed');
                }
            } catch (Exception $e) {
                error_log("Update error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                    'debug_info' => [
                        'id' => $id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing slide ID'
            ]);
        }
        break;
}
?> 