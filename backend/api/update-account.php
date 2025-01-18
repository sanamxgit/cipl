<?php
header('Content-Type: application/json');
require_once '../config/database.php';

session_start();

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Verify user exists and current password if provided
        $stmt = $conn->prepare("SELECT id, password FROM users WHERE id = ?");
        $stmt->execute([$input['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new Exception('User not found');
        }

        // If changing password, verify current password
        if ($input['newPassword']) {
            if (!password_verify($input['currentPassword'], $user['password'])) {
                throw new Exception('Current password is incorrect');
            }
        }

        // Update user information
        $query = "UPDATE users SET name = ?, email = ?";
        $params = [$input['name'], $input['email']];

        // Add password update if provided
        if ($input['newPassword']) {
            $query .= ", password = ?";
            $params[] = password_hash($input['newPassword'], PASSWORD_DEFAULT);
        }

        $query .= " WHERE id = ?";
        $params[] = $input['userId'];

        $stmt = $conn->prepare($query);
        $stmt->execute($params);

        echo json_encode([
            'status' => 'success',
            'message' => 'Account updated successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} 