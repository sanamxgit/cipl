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
            return $this->conn;
        } catch(PDOException $exception) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $exception->getMessage()
            ]);
            return null;
        }
    }
}
?> 