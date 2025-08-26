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

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // First, check if Autodesk brand exists
        $brandStmt = $conn->prepare("SELECT id FROM brands WHERE name = 'Autodesk' LIMIT 1");
        $brandStmt->execute();
        $brand = $brandStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$brand) {
            echo json_encode([
                'status' => 'success',
                'data' => [],
                'message' => 'No Autodesk brand found'
            ]);
            return;
        }
        
        // Always get all Autodesk products
        $stmt = $conn->prepare("
            SELECT p.*, b.name as brand_name
            FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.name = 'Autodesk' 
            AND p.is_active = 1
            ORDER BY p.position, p.name
        ");
        $stmt->execute();
        
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
            'message' => 'Failed to fetch products: ' . $e->getMessage()
        ]);
    }
} 