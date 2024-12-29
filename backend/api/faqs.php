<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

class FAQs {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllFAQs() {
        try {
            $query = "SELECT * FROM faqs ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function addFAQ($data) {
        try {
            $query = "INSERT INTO faqs (question, answer, is_active, position) 
                     VALUES (:question, :answer, :is_active, :position)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':question', $data['question']);
            $stmt->bindParam(':answer', $data['answer']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            $stmt->bindParam(':position', $data['position'], PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function updateFAQ($id, $data) {
        try {
            $query = "UPDATE faqs SET 
                    question = :question,
                    answer = :answer,
                    is_active = :is_active,
                    position = :position
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':question', $data['question']);
            $stmt->bindParam(':answer', $data['answer']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            $stmt->bindParam(':position', $data['position'], PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function deleteFAQ($id) {
        try {
            $query = "DELETE FROM faqs WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$faqs = new FAQs($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $result = $faqs->getAllFAQs();
            echo json_encode([
                'status' => 'success',
                'data' => $result
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if($faqs->addFAQ($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ added successfully'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if ($id) {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                if($faqs->updateFAQ($id, $data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'FAQ updated successfully'
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
        break;
        
    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if($id) {
            try {
                if($faqs->deleteFAQ($id)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'FAQ deleted successfully'
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
        break;
}
?> 