<?php
// Database connection settings.
// Update these to match your local MySQL / XAMPP / phpMyAdmin setup.
$DB_HOST = 'localhost';
$DB_NAME = 'student_affairs';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed. Check config.php and make sure the "student_affairs" database has been imported from schema.sql.']);
    exit;
}
