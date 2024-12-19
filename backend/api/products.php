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

class Products {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getProductsByBrand($brandId) {
        try {
            $query = "SELECT id, name, description, image_url, price, 
                             primary_button_text, secondary_button_text, position 
                      FROM products 
                      WHERE brand_id = :brand_id AND is_active = true 
                      ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':brand_id', $brandId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function toggleActive($id) {
        try {
            $query = "UPDATE products SET is_active = NOT is_active WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }

    public function addProduct($data) {
        try {
            // Debug log
            error_log("Adding product with data: " . print_r($data, true));
            
            $query = "INSERT INTO products (
                brand_id, name, description, image_url, price,
                primary_button_text, secondary_button_text, is_active
            ) VALUES (
                :brand_id, :name, :description, :image_url, :price,
                :primary_button_text, :secondary_button_text, :is_active
            )";
            
            $stmt = $this->conn->prepare($query);
            
            // Convert and validate data types
            $brandId = (int)$data['brand_id'];
            $price = (float)$data['price'];
            $isActive = (bool)$data['is_active'];
            
            $stmt->bindParam(':brand_id', $brandId, PDO::PARAM_INT);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':primary_button_text', $data['primary_button_text']);
            $stmt->bindParam(':secondary_button_text', $data['secondary_button_text']);
            $stmt->bindParam(':is_active', $isActive, PDO::PARAM_BOOL);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Database error: " . print_r($stmt->errorInfo(), true));
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in addProduct: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function getAllProducts() {
        try {
            $query = "SELECT p.*, b.name as brand_name 
                     FROM products p 
                     LEFT JOIN brands b ON p.brand_id = b.id 
                     ORDER BY p.position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function updateProduct($id, $data) {
        try {
            // Debug log
            error_log("Updating product {$id} with data: " . print_r($data, true));
            
            $query = "UPDATE products SET 
                brand_id = :brand_id,
                name = :name,
                description = :description,
                image_url = :image_url,
                price = :price,
                primary_button_text = :primary_button_text,
                secondary_button_text = :secondary_button_text,
                is_active = :is_active
                WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            // Convert and validate data types
            $brandId = (int)$data['brand_id'];
            $price = (float)$data['price'];
            $isActive = (bool)$data['is_active'];
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':brand_id', $brandId, PDO::PARAM_INT);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':primary_button_text', $data['primary_button_text']);
            $stmt->bindParam(':secondary_button_text', $data['secondary_button_text']);
            $stmt->bindParam(':is_active', $isActive, PDO::PARAM_BOOL);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Update failed: " . print_r($stmt->errorInfo(), true));
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in updateProduct: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$products = new Products($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['brand_id'])) {
        $brandId = isset($_GET['brand_id']) ? $_GET['brand_id'] : null;
        if ($brandId) {
            try {
                $result = $products->getProductsByBrand($brandId);
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
        }
    } else {
        // Return all products for admin
        try {
            $result = $products->getAllProducts();
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
    }
} else if ($method === 'PUT') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        try {
            if (isset($_GET['action']) && $_GET['action'] === 'toggle') {
                if ($products->toggleActive($id)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Product status toggled successfully'
                    ]);
                } else {
                    throw new Exception('Failed to toggle product status');
                }
            } else {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                // Debug logging
                error_log("Received PUT data: " . print_r($data, true));
                
                // Validate required fields
                $requiredFields = ['brand_id', 'name', 'image_url'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || empty($data[$field])) {
                        throw new Exception("Missing required field: {$field}");
                    }
                }
                
                // Ensure brand_id is numeric
                if (!is_numeric($data['brand_id'])) {
                    throw new Exception("Invalid brand_id");
                }
                
                // Set default values for optional fields
                $data['description'] = $data['description'] ?? '';
                $data['price'] = $data['price'] ?? 0;
                $data['primary_button_text'] = $data['primary_button_text'] ?? 'Plans & Pricing';
                $data['secondary_button_text'] = $data['secondary_button_text'] ?? 'Free Trial';
                $data['is_active'] = $data['is_active'] ?? true;
                
                if ($products->updateProduct($id, $data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Product updated successfully'
                    ]);
                } else {
                    throw new Exception('Failed to update product');
                }
            }
        } catch (Exception $e) {
            error_log("Error updating product: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing product ID'
        ]);
    }
} else if ($method === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Debug logging
        error_log("Received POST data: " . print_r($data, true));
        
        // Validate required fields
        $requiredFields = ['brand_id', 'name', 'image_url'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("Missing required field: {$field}");
            }
        }
        
        // Ensure brand_id is numeric
        if (!is_numeric($data['brand_id'])) {
            throw new Exception("Invalid brand_id");
        }
        
        // Set default values for optional fields
        $data['description'] = $data['description'] ?? '';
        $data['price'] = $data['price'] ?? 0;
        $data['primary_button_text'] = $data['primary_button_text'] ?? 'Plans & Pricing';
        $data['secondary_button_text'] = $data['secondary_button_text'] ?? 'Free Trial';
        $data['is_active'] = $data['is_active'] ?? true;
        
        if ($products->addProduct($data)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Product added successfully'
            ]);
        } else {
            throw new Exception('Failed to add product');
        }
    } catch (Exception $e) {
        error_log("Error adding product: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}
?> 