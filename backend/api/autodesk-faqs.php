<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM autodesk_faqs ORDER BY sort_order ASC");
        $stmt->execute();
        $faqs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $faqs
        ]);
    } catch (Exception $e) {
        error_log('Error fetching Autodesk FAQs: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch FAQs'
        ]);
    }
}

else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['action'])) {
            throw new Exception('Action is required');
        }

        switch ($input['action']) {
            case 'add':
                if (!isset($input['question']) || !isset($input['answer'])) {
                    throw new Exception('Question and answer are required');
                }

                $stmt = $conn->prepare("
                    INSERT INTO autodesk_faqs (question, answer, sort_order)
                    VALUES (?, ?, ?)
                ");
                
                $stmt->execute([
                    $input['question'],
                    $input['answer'],
                    $input['sort_order'] ?? 0
                ]);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ added successfully',
                    'id' => $conn->lastInsertId()
                ]);
                break;

            case 'update':
                $stmt = $conn->prepare("
                    UPDATE autodesk_faqs 
                    SET question = ?, answer = ?, sort_order = ?
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    $input['question'],
                    $input['answer'],
                    $input['sort_order'] ?? 0,
                    $input['id']
                ]);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ updated successfully'
                ]);
                break;

            case 'delete':
                $stmt = $conn->prepare("DELETE FROM autodesk_faqs WHERE id = ?");
                $stmt->execute([$input['id']]);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ deleted successfully'
                ]);
                break;

            default:
                throw new Exception('Invalid action');
        }
    } catch (Exception $e) {
        error_log('Error managing Autodesk FAQs: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} 