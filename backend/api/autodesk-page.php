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
        $stmt = $conn->prepare("SELECT * FROM autodesk_page LIMIT 1");
        $stmt->execute();
        $pageData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pageData) {
            // Return default data structure if no data exists
            $pageData = [
                'banner_image' => '/images/autodesk-banner.jpg',
                'banner_title' => 'Autodesk AI helps you do more with less',
                'banner_subtitle' => 'Our AI technology is available in Autodesk products to help you stay ahead of industry demands and technological shifts—boosting ambition, creativity, and sustainability.',
                'banner_button_text' => 'Learn more',
                'banner_button_link' => '#',
                'help_section_title' => 'Need help finding the right product?',
                'help_section_description' => 'Our product experts are here to help you choose the best solution for your needs.',
                'quote_button_text' => 'Get a Quote',
                'quote_button_link' => '/contact'
            ];
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
            'message' => 'Failed to fetch page data'
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        if ($input['action'] === 'update') {
            $data = $input['data'];
            
            // Check if record exists, if not create it
            $checkStmt = $conn->prepare("SELECT id FROM autodesk_page LIMIT 1");
            $checkStmt->execute();
            $exists = $checkStmt->fetch();
            
            if ($exists) {
                // Update existing record
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
            } else {
                // Insert new record
                $stmt = $conn->prepare("
                    INSERT INTO autodesk_page (
                        banner_image, banner_title, banner_subtitle, 
                        banner_button_text, banner_button_link,
                        help_section_title, help_section_description,
                        quote_button_text, quote_button_link
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
            }
            
            $stmt->execute([
                $data['banner_image'] ?? '',
                $data['banner_title'] ?? '',
                $data['banner_subtitle'] ?? '',
                $data['banner_button_text'] ?? 'Learn more',
                $data['banner_button_link'] ?? '#',
                $data['help_section_title'] ?? '',
                $data['help_section_description'] ?? '',
                $data['quote_button_text'] ?? 'Get a Quote',
                $data['quote_button_link'] ?? '/contact'
            ]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Page updated successfully'
            ]);
        } else {
            throw new Exception('Invalid action');
        }
    } catch (Exception $e) {
        error_log('Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} 