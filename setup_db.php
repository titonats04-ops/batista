<?php
// This file sets up the database and users table
// Run this once to initialize the database

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'webdev_db');

// Connect to MySQL without selecting a database first
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists.\n";
} else {
    echo "Error creating database: " . $conn->error . "\n";
}

// Select the database
$conn->select_db(DB_NAME);

// Create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
)";

if ($conn->query($sql) === TRUE) {
    echo "Users table created successfully or already exists.\n";
} else {
    echo "Error creating users table: " . $conn->error . "\n";
}

// Insert a demo user (optional)
$demo_email = 'demo@example.com';
$demo_password = 'demo1234';
$demo_username = 'demouser';
$password_hash = password_hash($demo_password, PASSWORD_BCRYPT);

$sql = "INSERT INTO users (email, username, password_hash, full_name) 
        VALUES ('$demo_email', '$demo_username', '$password_hash', 'Demo User')
        ON DUPLICATE KEY UPDATE password_hash = '$password_hash'";

if ($conn->query($sql) === TRUE) {
    echo "Demo user created/updated: email=$demo_email, password=$demo_password\n";
} else {
    echo "Error inserting demo user: " . $conn->error . "\n";
}

$conn->close();
echo "\nDatabase setup complete!\n";
?>
