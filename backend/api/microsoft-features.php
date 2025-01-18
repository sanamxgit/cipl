<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM microsoft_features ORDER BY sort_order ASC");
        $stmt->execute();
        $features = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug log
        error_log('Fetched features: ' . print_r($features, true));

        echo json_encode([
            'status' => 'success',
            'data' => $features
        ]);
    } catch (Exception $e) {
        error_log('Error fetching features: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch features'
        ]);
    }
}

else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($input['action']) {
            case 'add':
                $stmt = $conn->prepare("
                    INSERT INTO microsoft_features 
                    (title, description, image_url, link_url, sort_order) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $input['title'],
                    $input['description'],
                    $input['image_url'],
                    $input['link_url'],
                    $input['sort_order'] ?? 0
                ]);
                
                $message = 'Feature added successfully';
                break;

            case 'update':
                $stmt = $conn->prepare("
                    UPDATE microsoft_features 
                    SET title = ?, description = ?, image_url = ?, 
                        link_url = ?, sort_order = ?
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    $input['title'],
                    $input['description'],
                    $input['image_url'],
                    $input['link_url'],
                    $input['sort_order'] ?? 0,
                    $input['id']
                ]);
                
                $message = 'Feature updated successfully';
                break;

            case 'delete':
                $stmt = $conn->prepare("DELETE FROM microsoft_features WHERE id = ?");
                $stmt->execute([$input['id']]);
                $message = 'Feature deleted successfully';
                break;

            default:
                throw new Exception('Invalid action');
        }

        echo json_encode([
            'status' => 'success',
            'message' => $message
        ]);
    } catch (Exception $e) {
        error_log('Error managing features: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} 