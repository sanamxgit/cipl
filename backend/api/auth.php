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
require_once '../config/database.php';

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    try {
        if ($action === 'login') {
            $email = $input['email'];
            $password = $input['password'];

            // First try to find the user
            $stmt = $conn->prepare("
                SELECT id, name, email, password, role 
                FROM users 
                WHERE email = ?
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
                        'role' => $user['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ]);
            }
        } elseif ($action === 'register') {
            $name = $input['name'];
            $email = $input['email'];
            $password = password_hash($input['password'], PASSWORD_DEFAULT);

            $stmt = $conn->prepare("
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, 'user')
            ");
            $stmt->execute([$name, $email, $password]);

            echo json_encode([
                'status' => 'success',
                'user' => [
                    'id' => $conn->lastInsertId(),
                    'name' => $name,
                    'email' => $email,
                    'role' => 'user'
                ]
            ]);
        }
    } catch (Exception $e) {
        error_log('Auth error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Server error'
        ]);
    }
} 