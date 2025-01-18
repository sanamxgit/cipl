<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: http://localhost:3000');
require_once '../config/database.php';

session_start();

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // First check if there's an active session
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['last_activity'])) {
            throw new Exception('No active session');
        }

        // Check session timeout (30 minutes)
        if (time() - $_SESSION['last_activity'] > 1800) {
            session_destroy();
            throw new Exception('Session expired');
        }

        if (isset($input['user'])) {
            $userId = $input['user']['id'];
            $email = $input['user']['email'];

            // Verify session matches
            if ($_SESSION['user_id'] != $userId) {
                throw new Exception('Invalid session');
            }

            $stmt = $conn->prepare("
                SELECT id, name, email, role, last_login, last_activity
                FROM users 
                WHERE id = ? AND email = ? AND role = 'admin'
                AND last_login IS NOT NULL
                AND last_activity > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
            ");
            $stmt->execute([$userId, $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Update last activity
                $stmt = $conn->prepare("
                    UPDATE users 
                    SET last_activity = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$userId]);

                // Update session activity
                $_SESSION['last_activity'] = time();

                echo json_encode([
                    'status' => 'success',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ]);
            } else {
                session_destroy();
                throw new Exception('Unauthorized access');
            }
        } else {
            throw new Exception('Invalid request');
        }
    } catch (Exception $e) {
        session_destroy();
        error_log('Auth verification error: ' . $e->getMessage());
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
} 