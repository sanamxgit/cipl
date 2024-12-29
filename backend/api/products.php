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

    public function getAllProducts($brandId = null) {
        try {
            $query = "SELECT p.*, b.name as brand_name, 
                      CASE WHEN p.is_active = 1 THEN true ELSE false END as is_active 
                      FROM products p 
                      LEFT JOIN brands b ON p.brand_id = b.id
                      WHERE p.is_active = 1";
            
            if ($brandId && $brandId !== '1') {
                $query .= " AND p.brand_id = :brand_id";
            }
            
            $query .= " ORDER BY p.position";
            
            $stmt = $this->conn->prepare($query);
            
            if ($brandId && $brandId !== '1') {
                error_log("Fetching products for brand ID: " . $brandId);
                $stmt->bindParam(':brand_id', $brandId, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Found " . count($result) . " products");
            return $result;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function getAllProductsAdmin($brandId = null) {
        try {
            $query = "SELECT p.*, b.name as brand_name, 
                      CASE WHEN p.is_active = 1 THEN true ELSE false END as is_active 
                      FROM products p 
                      LEFT JOIN brands b ON p.brand_id = b.id";
            
            if ($brandId) {
                $query .= " WHERE p.brand_id = :brand_id";
            }
            
            $query .= " ORDER BY p.position";
            
            $stmt = $this->conn->prepare($query);
            
            if ($brandId) {
                $stmt->bindParam(':brand_id', $brandId, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return [];
        }
    }

    public function updateProduct($id, $data) {
        try {
            // For status toggle, we only need to update is_active
            if (isset($data['is_active']) && count((array)$data) === 1) {
                $query = "UPDATE products SET 
                        is_active = :is_active
                        WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                
                // Convert is_active to integer for MySQL
                $isActive = $data['is_active'] ? 1 : 0;
                error_log("Updating product {$id} status to: {$isActive}");
                
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->bindParam(':is_active', $isActive, PDO::PARAM_INT);
            } else {
                // Full product update
                $query = "UPDATE products SET 
                        name = :name,
                        brand_id = :brand_id,
                        description = :description,
                        image_url = :image_url,
                        price = :price,
                        primary_button_text = :primary_button_text,
                        secondary_button_text = :secondary_button_text,
                        is_active = :is_active,
                        updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                
                $isActive = $data['is_active'] ? 1 : 0;
                
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->bindParam(':name', $data['name']);
                $stmt->bindParam(':brand_id', $data['brand_id']);
                $stmt->bindParam(':description', $data['description']);
                $stmt->bindParam(':image_url', $data['image_url']);
                $stmt->bindParam(':price', $data['price']);
                $stmt->bindParam(':primary_button_text', $data['primary_button_text']);
                $stmt->bindParam(':secondary_button_text', $data['secondary_button_text']);
                $stmt->bindParam(':is_active', $isActive, PDO::PARAM_INT);
            }
            
            if (!$stmt->execute()) {
                error_log("Update failed for product {$id}: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            return true;
        } catch (PDOException $e) {
            error_log("Database error in updateProduct for ID {$id}: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function getProductById($id) {
        try {
            $query = "SELECT p.*, b.name as brand_name,
                      CASE WHEN p.is_active = 1 THEN true ELSE false END as is_active
                      FROM products p 
                      LEFT JOIN brands b ON p.brand_id = b.id
                      WHERE p.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result) {
                $result['is_active'] = (bool)$result['is_active'];
            }
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in getProductById: " . $e->getMessage());
            return null;
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$products = new Products($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $brandId = isset($_GET['brand_id']) ? $_GET['brand_id'] : null;
        $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
        
        // Use different methods for admin and frontend
        $result = $isAdmin 
            ? $products->getAllProductsAdmin($brandId)
            : $products->getAllProducts($brandId);
            
        echo json_encode([
            'status' => 'success',
            'data' => array_map(function($product) {
                $product['is_active'] = (bool)$product['is_active'];
                return $product;
            }, $result)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else if ($method === 'PUT') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("Received PUT data for product {$id}: " . print_r($data, true));

            if ($products->updateProduct($id, $data)) {
                $updatedProduct = $products->getProductById($id);
                if ($updatedProduct) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Product updated successfully',
                        'data' => $updatedProduct
                    ]);
                } else {
                    throw new Exception('Failed to fetch updated product');
                }
            } else {
                throw new Exception('Failed to update product');
            }
        } catch (Exception $e) {
            error_log("Error updating product {$id}: " . $e->getMessage());
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