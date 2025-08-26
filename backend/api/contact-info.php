<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class ContactInfoManager {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getContactInfo() {
        try {
            $query = "SELECT * FROM contact_info ORDER BY id ASC LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                // Create default contact info if none exists
                $result = $this->createDefaultContactInfo();
            }

            return $result;
        } catch (PDOException $e) {
            error_log("Database error in getContactInfo: " . $e->getMessage());
            return null;
        }
    }

    public function updateContactInfo($data) {
        try {
            $query = "UPDATE contact_info SET 
                phone_number = ?, 
                email = ?, 
                chat_title = ?, 
                chat_description = ?, 
                call_title = ?, 
                call_description = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['phone_number'],
                $data['email'],
                $data['chat_title'],
                $data['chat_description'],
                $data['call_title'],
                $data['call_description'],
                $data['id']
            ]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Database error in updateContactInfo: " . $e->getMessage());
            return false;
        }
    }

    private function createDefaultContactInfo() {
        try {
            $query = "INSERT INTO contact_info (phone_number, email, chat_title, chat_description, call_title, call_description) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                '+977-980000000',
                'service@cipl.com',
                'Chat Now',
                'Chat with our support team for quick answers on product features, pricing and more.',
                'Call Us',
                'Call Our Award Winning Support 24/7'
            ]);

            return $this->getContactInfo();
        } catch (PDOException $e) {
            error_log("Database error in createDefaultContactInfo: " . $e->getMessage());
            return null;
        }
    }
}

// Initialize database connection
try {
    $database = new Database();
    $db = $database->getConnection();
    $contactManager = new ContactInfoManager($db);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $contactInfo = $contactManager->getContactInfo();
        if ($contactInfo) {
            echo json_encode(['status' => 'success', 'data' => $contactInfo]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve contact information']);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input && isset($input['id'])) {
            $success = $contactManager->updateContactInfo($input);
            if ($success) {
                echo json_encode(['status' => 'success', 'message' => 'Contact information updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update contact information']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
?>
