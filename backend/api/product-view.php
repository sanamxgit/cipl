<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $slug = $_GET['slug'] ?? '';
        
        if ($slug === 'autodesk') {
            // Return Autodesk brand page data
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'title' => 'Autodesk Products',
                    'description' => 'Explore our range of Autodesk products',
                    'brand' => 'Autodesk',
                    'banner_image' => '/images/autodesk-banner.jpg',
                    // Add other necessary fields
                ]
            ]);
        } else {
            // Handle other product views
            $stmt = $conn->prepare("
                SELECT p.*, b.name as brand_name
                FROM products p
                JOIN brands b ON p.brand_id = b.id
                WHERE p.slug = ?
            ");
            $stmt->execute([$slug]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($product) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $product
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Product not found'
                ]);
            }
        }
    } catch (Exception $e) {
        error_log('Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Server error'
        ]);
    }
} 