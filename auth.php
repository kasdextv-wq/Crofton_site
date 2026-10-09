<?php
// Server-side auth for admin pages. Password is stored in .env, not in HTML/JS.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
session_start();

function load_env_file($path) {
    $env = [];
    if (!file_exists($path)) return $env;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));
        $val = trim($val, " \t\n\r\0\x0B\"'");
        $env[$key] = $val;
    }
    return $env;
}
$env = load_env_file(__DIR__.'/.env');
$adminPassword = $env['ADMIN_PASSWORD'] ?? '';
$action = $_GET['action'] ?? '';

if ($action === 'check') {
    echo json_encode(['ok' => !empty($_SESSION['crofton_admin'])]);
    exit;
}
if ($action === 'logout') {
    unset($_SESSION['crofton_admin']);
    echo json_encode(['ok' => true]);
    exit;
}
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;
    $password = (string)($data['password'] ?? '');
    if ($adminPassword !== '' && hash_equals($adminPassword, $password)) {
        $_SESSION['crofton_admin'] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Неверный пароль']);
    }
    exit;
}
http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Bad request']);
