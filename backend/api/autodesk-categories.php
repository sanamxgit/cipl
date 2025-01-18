<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM autodesk_categories ORDER BY sort_order");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $categories
        ]);
    } catch (Exception $e) {
        error_log('Error fetching categories: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch categories'
        ]);
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['action']) || !isset($input['category_id']) || !isset($input['product_ids'])) {
            throw new Exception('Missing required parameters');
        }
        
        $conn->beginTransaction();
        
        if ($input['action'] === 'assign_products') {
            // First remove existing assignments
            $stmt = $conn->prepare("DELETE FROM product_categories WHERE category_id = ?");
            $stmt->execute([$input['category_id']]);
            
            // Then add new assignments
            if (!empty($input['product_ids'])) {
                $stmt = $conn->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
                foreach ($input['product_ids'] as $productId) {
                    $stmt->execute([$productId, $input['category_id']]);
                }
            }
            
            $conn->commit();
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Products assigned successfully'
            ]);
        }
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log('Error assigning products: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to assign products: ' . $e->getMessage()
        ]);
    }
} 