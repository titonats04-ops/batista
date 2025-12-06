<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['identifier']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing email/username or password']);
    exit();
}

$identifier = trim($input['identifier']);
$password = trim($input['password']);

// Validate input
if (empty($identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

// Check if identifier is email or username
$is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
$field = $is_email ? 'email' : 'username';

// Prepare and execute query
$stmt = $conn->prepare("SELECT id, username, email, password_hash, full_name FROM users WHERE $field = ? AND is_active = TRUE");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit();
}

$stmt->bind_param('s', $identifier);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email/username or password']);
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email/username or password']);
    exit();
}

// Set session data
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['name'] = $user['full_name'] ?? $user['username'];
$_SESSION['login_time'] = time();

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'name' => $user['full_name'] ?? $user['username']
    ]
]);

$conn->close();
?>
