<?php
header('Content-Type: application/json');
require_once 'config.php';

// Destroy session
session_destroy();

// Also clear the user from localStorage via response
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?>
