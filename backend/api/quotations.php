<?php
// Start output buffering to prevent unwanted output
ob_start();

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
        
        // Check if input is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON: ' . json_last_error_msg());
        }

        // Test mode - if test parameter is present, return success without database operation
        if (isset($input['test']) && $input['test'] === true) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Test quotation submitted successfully',
                'id' => 999,
                'test_mode' => true
            ]);
            exit;
        }

        // Validate required fields
        if (empty($input['fullName']) || empty($input['email']) || empty($input['phoneNumber'])) {
            throw new Exception('Required fields are missing');
        }

        // Check if quotations table exists
        $tableCheck = $conn->prepare("SHOW TABLES LIKE 'quotations'");
        $tableCheck->execute();
        if (!$tableCheck->fetch()) {
            throw new Exception('Quotations table does not exist. Please run the database setup.');
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
            $quotationId = $conn->lastInsertId();
            
            // Clear any previous output
            if (ob_get_length()) ob_clean();
            
            // Set proper headers
            http_response_code(200);
            header('Content-Type: application/json; charset=UTF-8');
            
            $response = [
                'status' => 'success',
                'message' => 'Quotation submitted successfully',
                'id' => $quotationId
            ];
            
            echo json_encode($response);
            exit; // Ensure no additional output
        } else {
            $error = $stmt->errorInfo();
            error_log('Database error details: ' . print_r($error, true));
            throw new Exception('Database error: ' . $error[2]);
        }
    } catch (Exception $e) {
        error_log('Error in quotations.php: ' . $e->getMessage());
        
        // Clear any previous output
        if (ob_get_length()) ob_clean();
        
        // Set proper headers
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        
        $response = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
        
        echo json_encode($response);
        exit; // Ensure no additional output
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
                created_at
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
        if (!in_array($data['status'], ['pending', 'contacted', 'completed'])) {
            throw new Exception('Invalid status value');
        }

        $stmt = $conn->prepare("
            UPDATE quotations 
            SET 
                status = :status
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