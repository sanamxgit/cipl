<?php
define('DEBUG', true);  // Set to false in production

class Database {
    private $host = "localhost";
    private $db_name = "cipl";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            if ($this->conn) {
                error_log("Database connected successfully");
            }
            
            return $this->conn;
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Database connection failed'
            ]);
            return null;
        }
    }
}
?> 