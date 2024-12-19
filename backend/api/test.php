<?php
// Clear any existing headers
if (function_exists('header_remove')) {
    header_remove();
}

// Set headers once
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'API is working'
]);
?> 