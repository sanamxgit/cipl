<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get products tagged with Microsoft brand
        $stmt = $conn->prepare("
            SELECT p.* 
            FROM products p
            JOIN product_brands pb ON p.id = pb.product_id
            JOIN brands b ON pb.brand_id = b.id
            WHERE b.name = 'Microsoft'
            ORDER BY p.created_at DESC
        ");
        
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => $products
        ]);
    } catch (Exception $e) {
        error_log('Error fetching Microsoft products: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch Microsoft products'
        ]);
    }
} 