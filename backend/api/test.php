<?php
// Clear any existing headers
header_remove();

// Set headers once
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

echo json_encode([
    'status' => 'success',
    'message' => 'API is working'
]);
?> 