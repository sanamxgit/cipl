<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Debug input
        error_log('Received input: ' . print_r($input, true));

        // Validate required fields
        if (empty($input['fullName']) || empty($input['email']) || empty($input['phoneNumber'])) {
            throw new Exception('Required fields are missing');
        }

        // Insert into database
        $stmt = $conn->prepare("
            INSERT INTO quotations 
            (full_name, email, phone_number, company_name, country, product_type, product_name, message, status)
            VALUES (:fullName, :email, :phone, :company, :country, :productType, :productName, :message, :status)
        ");
        
        $params = [
            ':fullName' => $input['fullName'],
            ':email' => $input['email'],
            ':phone' => $input['phoneNumber'],
            ':company' => $input['companyName'] ?? '',
            ':country' => $input['country'] ?? '',
            ':productType' => $input['productType'] ?? '',
            ':productName' => $input['productName'] ?? '',
            ':message' => $input['message'] ?? '',
            ':status' => 'pending'
        ];

        // Debug SQL and params
        error_log('SQL: ' . $stmt->queryString);
        error_log('Params: ' . print_r($params, true));

        $result = $stmt->execute($params);

        if ($result) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Quotation submitted successfully'
            ]);
        } else {
            $error = $stmt->errorInfo();
            throw new Exception('Database error: ' . $error[2]);
        }
    } catch (Exception $e) {
        error_log('Error in quotations.php: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT 
                id,
                full_name,
                email,
                phone_number,
                company_name,
                country,
                product_type,
                product_name,
                message,
                status,
                created_at,
                updated_at
            FROM quotations 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $quotations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug log to check status values
        error_log('Fetched quotations: ' . print_r($quotations, true));
        
        echo json_encode([
            'status' => 'success',
            'data' => $quotations
        ]);
    } catch (Exception $e) {
        error_log('Error fetching quotations: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch quotations'
        ]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        error_log('PUT request data: ' . print_r($data, true));

        // Validate the status value
        if (!in_array($data['status'], ['pending', 'done'])) {
            throw new Exception('Invalid status value');
        }

        $stmt = $conn->prepare("
            UPDATE quotations 
            SET 
                status = :status,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        
        $params = [
            ':id' => $data['id'],
            ':status' => $data['status']
        ];

        error_log('Update params: ' . print_r($params, true));
        
        $result = $stmt->execute($params);

        if ($result) {
            // Verify the update
            $verify = $conn->prepare("SELECT status FROM quotations WHERE id = ?");
            $verify->execute([$data['id']]);
            $updated = $verify->fetch(PDO::FETCH_ASSOC);
            
            error_log('Verified status after update: ' . print_r($updated, true));

            echo json_encode([
                'status' => 'success',
                'message' => 'Status updated successfully',
                'data' => $updated
            ]);
        } else {
            $error = $stmt->errorInfo();
            throw new Exception('Database error: ' . $error[2]);
        }
    } catch (Exception $e) {
        error_log('Error updating status: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}
?> 