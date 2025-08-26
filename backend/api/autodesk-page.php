<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

error_log('Request received: ' . $_SERVER['REQUEST_METHOD']);

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        error_log('Executing SELECT query');
        $stmt = $conn->prepare("SELECT * FROM autodesk_page LIMIT 1");
        $stmt->execute();
        $pageData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log('Query result: ' . print_r($pageData, true));

        if (!$pageData) {
            error_log('No data found, inserting default values');
            // Your existing insert code...
        }

        echo json_encode([
            'status' => 'success',
            'data' => $pageData
        ]);
    } catch (Exception $e) {
        error_log('Error in GET request: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input['action'] === 'update') {
            $stmt = $conn->prepare("
                UPDATE autodesk_page SET
                banner_image = ?,
                banner_title = ?,
                banner_subtitle = ?,
                banner_button_text = ?,
                banner_button_link = ?,
                help_section_title = ?,
                help_section_description = ?,
                quote_button_text = ?,
                quote_button_link = ?
                WHERE id = 1
            ");
            
            $stmt->execute([
                $input['data']['banner_image'],
                $input['data']['banner_title'],
                $input['data']['banner_subtitle'],
                $input['data']['banner_button_text'],
                $input['data']['banner_button_link'],
                $input['data']['help_section_title'],
                $input['data']['help_section_description'],
                $input['data']['quote_button_text'],
                $input['data']['quote_button_link']
            ]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Page updated successfully'
            ]);
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