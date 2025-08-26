<?php
define('DEBUG', true);  // Set to false in production

class Database {
    private $host = "localhost";
    private $db_name = "cipl";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        try {
            error_log('Attempting database connection');
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log('Database connection successful');
            return $this->conn;
        } catch(PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            throw new Exception("Connection failed: " . $e->getMessage());
        }
    }
}
?> 