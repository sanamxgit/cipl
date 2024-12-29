<?php
if (function_exists('header_remove')) {
    header_remove();
}

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class Brands {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getBrands() {
        try {
            $query = "SELECT * FROM brands ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function addBrand($data) {
        $query = "INSERT INTO brands (name, logo_url, description, is_active) 
                 VALUES (:name, :logo_url, :description, :is_active)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':logo_url', $data['logo_url']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }

    public function updateBrand($id, $data) {
        $query = "UPDATE brands SET 
                name = :name,
                logo_url = :logo_url,
                description = :description,
                is_active = :is_active,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':logo_url', $data['logo_url']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
        $stmt->bindParam(':id', $id);
        
        return $stmt->execute();
    }

    public function deleteBrand($id) {
        $query = "DELETE FROM brands WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function toggleActive($id) {
        $query = "UPDATE brands SET is_active = NOT is_active WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$brands = new Brands($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $result = $brands->getBrands();
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
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if($brands->addBrand($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Brand created successfully'
                ]);
            } else {
                throw new Exception('Failed to create brand');
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
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if ($id) {
            $query = "UPDATE brands SET 
                      name = :name,
                      logo_url = :logo_url,
                      description = :description,
                      is_active = :is_active,
                      updated_at = CURRENT_TIMESTAMP
                      WHERE id = :id";
                      
            $stmt = $conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':logo_url', $data['logo_url']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Brand updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update brand');
            }
        }
        break;
        
    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if($id && $brands->deleteBrand($id)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Brand deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete brand'
            ]);
        }
        break;
}
?> 