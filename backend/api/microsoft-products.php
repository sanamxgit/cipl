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

class MicrosoftProducts {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getProducts() {
        try {
            // Get products with Microsoft brand using the correct table structure
            $stmt = $this->conn->prepare("
                SELECT p.*, b.name as brand_name
            FROM products p
                JOIN brands b ON p.brand_id = b.id
            WHERE b.name = 'Microsoft'
                ORDER BY p.position, p.created_at DESC
        ");
        
        $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function addProduct($data) {
        try {
            // First, get the Microsoft brand ID
            $brandStmt = $this->conn->prepare("SELECT id FROM brands WHERE name = 'Microsoft' LIMIT 1");
            $brandStmt->execute();
            $brand = $brandStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$brand) {
                throw new Exception('Microsoft brand not found');
            }

            $query = "INSERT INTO products (brand_id, name, description, image_url, price, primary_button_text, secondary_button_text, is_active, position) 
                     VALUES (:brand_id, :name, :description, :image_url, :price, :primary_button_text, :secondary_button_text, :is_active, :position)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':brand_id', $brand['id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':primary_button_text', $data['primary_button_text']);
            $stmt->bindParam(':secondary_button_text', $data['secondary_button_text']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            $stmt->bindParam(':position', $data['position']);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error adding product: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateProduct($id, $data) {
        try {
            $query = "UPDATE products SET 
                    name = :name,
                    description = :description,
                    image_url = :image_url,
                    price = :price,
                    primary_button_text = :primary_button_text,
                    secondary_button_text = :secondary_button_text,
                    is_active = :is_active,
                    position = :position
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':primary_button_text', $data['primary_button_text']);
            $stmt->bindParam(':secondary_button_text', $data['secondary_button_text']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            $stmt->bindParam(':position', $data['position']);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error updating product: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteProduct($id) {
        try {
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting product: " . $e->getMessage());
            throw $e;
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$microsoftProducts = new MicrosoftProducts($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $result = $microsoftProducts->getProducts();
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
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            $action = $data['action'] ?? '';
            
            switch($action) {
                case 'add':
                    if ($microsoftProducts->addProduct($data)) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Product added successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to add product');
                    }
                    break;
                    
                case 'update':
                    $id = $data['product']['id'] ?? null;
                    if ($id && $microsoftProducts->updateProduct($id, $data['product'])) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Product updated successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to update product');
                    }
                    break;
                    
                case 'delete':
                    $id = $data['product_id'] ?? null;
                    if ($id && $microsoftProducts->deleteProduct($id)) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Product deleted successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to delete product');
                    }
                    break;
                    
                default:
                    throw new Exception('Invalid action');
            }
        } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        break;
}
?> 