<?php
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

class MicrosoftFAQs {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllFAQs() {
        try {
            $query = "SELECT * FROM microsoft_faqs WHERE is_active = true ORDER BY sort_order, id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function getAllFAQsAdmin() {
        try {
            $query = "SELECT * FROM microsoft_faqs ORDER BY sort_order, id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function addFAQ($data) {
        try {
            $query = "INSERT INTO microsoft_faqs (question, answer, sort_order, is_active) 
                     VALUES (:question, :answer, :sort_order, :is_active)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':question', $data['question']);
            $stmt->bindParam(':answer', $data['answer']);
            $stmt->bindParam(':sort_order', $data['sort_order'], PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function updateFAQ($id, $data) {
        try {
            $query = "UPDATE microsoft_faqs SET 
                    question = :question,
                    answer = :answer,
                    sort_order = :sort_order,
                    is_active = :is_active
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':question', $data['question']);
            $stmt->bindParam(':answer', $data['answer']);
            $stmt->bindParam(':sort_order', $data['sort_order'], PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function deleteFAQ($id) {
        try {
            $query = "DELETE FROM microsoft_faqs WHERE id = :id";
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
$microsoftFAQs = new MicrosoftFAQs($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $admin = isset($_GET['admin']) && $_GET['admin'] === 'true';
            $result = $admin ? $microsoftFAQs->getAllFAQsAdmin() : $microsoftFAQs->getAllFAQs();
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
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid input data');
            }
            
            $requiredFields = ['question', 'answer'];
            foreach ($requiredFields as $field) {
                if (empty($input[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            $data = [
                'question' => $input['question'],
                'answer' => $input['answer'],
                'sort_order' => $input['sort_order'] ?? 0,
                'is_active' => $input['is_active'] ?? true
            ];
            
            if ($microsoftFAQs->addFAQ($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ added successfully'
                ]);
            } else {
                throw new Exception('Failed to add FAQ');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('FAQ ID is required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid input data');
            }
            
            $data = [
                'question' => $input['question'],
                'answer' => $input['answer'],
                'sort_order' => $input['sort_order'] ?? 0,
                'is_active' => $input['is_active'] ?? true
            ];
            
            if ($microsoftFAQs->updateFAQ($id, $data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update FAQ');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('FAQ ID is required');
            }
            
            if ($microsoftFAQs->deleteFAQ($id)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'FAQ deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete FAQ');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'OPTIONS':
        http_response_code(200);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        break;
}
?>
