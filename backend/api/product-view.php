<?php
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $slug = $_GET['slug'] ?? '';
    
    if (empty($slug)) {
        throw new Exception('Product slug is required');
    }

    $stmt = $conn->prepare("
        SELECT p.*, b.logo as partnerLogo, b.name as partnerName 
        FROM products p 
        JOIN brands b ON p.brand_id = b.id 
        WHERE p.slug = ?
    ");
    
    $stmt->execute([$slug]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        throw new Exception('Product not found');
    }

    echo json_encode([
        'status' => 'success',
        'product' => $product,
        'partnerLogo' => $product['partnerLogo']
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 