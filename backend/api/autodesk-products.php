<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $categoryId = isset($_GET['category']) ? $_GET['category'] : 'all';
        
        if ($categoryId === 'all') {
            // Get all Autodesk products
            $stmt = $conn->prepare("
                SELECT DISTINCT p.* 
                FROM products p
                JOIN product_brands pb ON p.id = pb.product_id
                JOIN brands b ON pb.brand_id = b.id
                WHERE b.name = 'Autodesk' 
                AND p.is_active = 1
                ORDER BY p.position, p.name
            ");
            $stmt->execute();
        } else {
            // Get products for specific category
            $stmt = $conn->prepare("
                SELECT DISTINCT p.* 
                FROM products p
                JOIN product_brands pb ON p.id = pb.product_id
                JOIN brands b ON pb.brand_id = b.id
                JOIN product_categories pc ON p.id = pc.product_id
                WHERE b.name = 'Autodesk'
                AND pc.category_id = ?
                AND p.is_active = 1
                ORDER BY p.position, p.name
            ");
            $stmt->execute([$categoryId]);
        }
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $products
        ]);
    } catch (Exception $e) {
        error_log('Error fetching products: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch products'
        ]);
    }
} 