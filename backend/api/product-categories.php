<?php
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $category = $_GET['category'] ?? '';
    
    if (empty($category)) {
        throw new Exception('Category is required');
    }

    // Fetch category data
    $stmt = $conn->prepare("
        SELECT * FROM product_categories 
        WHERE slug = ?
    ");
    
    $stmt->execute([$category]);
    $categoryData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$categoryData) {
        throw new Exception('Category not found');
    }

    echo json_encode([
        'status' => 'success',
        'data' => $categoryData
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 