<?php
header('Content-Type: application/json');
require_once 'config.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => true,
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'],
            'name' => $_SESSION['name']
        ]
    ]);
} else {
    echo json_encode([
        'success' => true,
        'logged_in' => false,
        'user' => null
    ]);
}
?>
