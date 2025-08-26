<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config/database.php';

class TrustedLeaders {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllLeaders() {
        try {
            $query = "SELECT * FROM trusted_leaders WHERE is_active = 1 ORDER BY position";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function addLeader($data) {
        try {
            $query = "INSERT INTO trusted_leaders (name, logo_url, is_active) 
                     VALUES (:name, :logo_url, :is_active)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':logo_url', $data['logo_url']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function updateLeader($id, $data) {
        try {
            $query = "UPDATE trusted_leaders SET 
                    name = :name,
                    logo_url = :logo_url,
                    is_active = :is_active
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':logo_url', $data['logo_url']);
            $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function deleteLeader($id) {
        try {
            $query = "DELETE FROM trusted_leaders WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }
}

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        error_log('Fetching trusted leaders');
        $stmt = $conn->prepare("
            SELECT * FROM trusted_leaders 
            WHERE is_active = 1 
            ORDER BY position ASC
        ");
        $stmt->execute();
        $leaders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        error_log('Found leaders: ' . print_r($leaders, true));

        echo json_encode([
            'status' => 'success',
            'data' => $leaders
        ]);
    } catch (Exception $e) {
        error_log('Error fetching leaders: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $trustedLeaders = new TrustedLeaders($conn);
            if($trustedLeaders->addLeader($data)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Leader added successfully'
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
                $trustedLeaders = new TrustedLeaders($conn);
                if($trustedLeaders->updateLeader($id, $data)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Leader updated successfully'
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
                $trustedLeaders = new TrustedLeaders($conn);
                if($trustedLeaders->deleteLeader($id)) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Leader deleted successfully'
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