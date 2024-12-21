<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

class FeaturedSection {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getSettings() {
        $query = "SELECT * FROM featured_section LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateSettings($data) {
        $query = "UPDATE featured_section SET 
                title = :title,
                brand_id = :brand_id
                WHERE id = 1";
                
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':brand_id', $data['brand_id']);
        
        return $stmt->execute();
    }
}

$database = new Database();
$db = $database->getConnection();
$featured = new FeaturedSection($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $result = $featured->getSettings();
        echo json_encode([
            'status' => 'success',
            'data' => $result
        ]);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($featured->updateSettings($data)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Settings updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update settings'
            ]);
        }
        break;
}
?> 