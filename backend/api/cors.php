<?php
function setCorsHeaders() {
    if (!headers_sent()) {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        // Echo requested headers if provided; else allow common headers (both cases included)
        $requested = isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])
            ? $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']
            : 'Content-Type, content-type, X-Requested-With, Authorization, authorization';
        header('Access-Control-Allow-Headers: ' . $requested);
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/json; charset=UTF-8');
    }
}
?>