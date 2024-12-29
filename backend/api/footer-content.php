<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class FooterContent {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllContent() {
        try {
            $query = "SELECT * FROM footer_content ORDER BY section, position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error in getAllContent: " . $e->getMessage());
            throw new Exception($e->getMessage());
        }
    }

    public function addContent($data) {
        try {
            error_log("Adding content with data: " . print_r($data, true));
            
            // For description section
            if ($data['section'] === 'description') {
                $query = "INSERT INTO footer_content (section, content) 
                         VALUES (:section, :content)";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':section', $data['section']);
                $stmt->bindParam(':content', $data['content']);
            } else {
                // For other sections with links
                $query = "INSERT INTO footer_content 
                         (section, title, link_text, link_url, position, is_active) 
                         VALUES 
                         (:section, :title, :link_text, :link_url, :position, :is_active)";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':section', $data['section']);
                $stmt->bindParam(':title', $data['title']);
                $stmt->bindParam(':link_text', $data['link_text']);
                $stmt->bindParam(':link_url', $data['link_url']);
                $stmt->bindParam(':position', $data['position'], PDO::PARAM_INT);
                $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            }
            
            $result = $stmt->execute();
            if (!$result) {
                error_log("Execute failed: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Failed to insert data");
            }
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in addContent: " . $e->getMessage());
            throw new Exception($e->getMessage());
        }
    }

    public function updateContent($id, $data) {
        try {
            if ($data['section'] === 'description') {
                $query = "UPDATE footer_content SET 
                        section = :section,
                        content = :content
                        WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':section', $data['section']);
                $stmt->bindParam(':content', $data['content']);
                $stmt->bindParam(':id', $id);
            } else {
                $query = "UPDATE footer_content SET 
                        section = :section,
                        title = :title,
                        link_text = :link_text,
                        link_url = :link_url,
                        position = :position,
                        is_active = :is_active
                        WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':section', $data['section']);
                $stmt->bindParam(':title', $data['title']);
                $stmt->bindParam(':link_text', $data['link_text']);
                $stmt->bindParam(':link_url', $data['link_url']);
                $stmt->bindParam(':position', $data['position'], PDO::PARAM_INT);
                $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
                $stmt->bindParam(':id', $id);
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error in updateContent: " . $e->getMessage());
            throw new Exception($e->getMessage());
        }
    }

    public function deleteContent($id) {
        try {
            $query = "DELETE FROM footer_content WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error in deleteContent: " . $e->getMessage());
            throw new Exception($e->getMessage());
        }
    }
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();
$footerContent = new FooterContent($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            $result = $footerContent->getAllContent();
            echo json_encode([
                'status' => 'success',
                'data' => $result
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("Received POST data: " . print_r($data, true));
            
            if($footerContent->addContent($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Footer content added successfully'
                ]);
            } else {
                throw new Exception('Failed to add footer content');
            }
            break;
            
        case 'PUT':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception('Missing ID parameter');
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            if($footerContent->updateContent($id, $data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Footer content updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update footer content');
            }
            break;
            
        case 'DELETE':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception('Missing ID parameter');
            }
            
            if($footerContent->deleteContent($id)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Footer content deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete footer content');
            }
            break;
    }
} catch (Exception $e) {
    error_log("Error in footer-content.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 