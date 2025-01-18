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
        if ($input['action'] === 'admin-login') {
            $email = $input['email'];
            $password = $input['password'];

            $stmt = $conn->prepare("
                SELECT id, name, email, password, role 
                FROM users 
                WHERE email = ? AND role = 'admin'
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                // Start a new session
                session_regenerate_id(true);
                
                // Update last login time
                $stmt = $conn->prepare("
                    UPDATE users 
                    SET last_login = NOW(),
                        last_activity = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$user['id']]);

                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['last_activity'] = time();

                echo json_encode([
                    'status' => 'success',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => 'admin'
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid admin credentials'
                ]);
            }
        }
    } catch (Exception $e) {
        error_log('Admin auth error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Server error'
        ]);
    }
} 