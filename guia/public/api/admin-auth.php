<?php

declare(strict_types=1);

require __DIR__ . '/repository.php';
require __DIR__ . '/admin-session.php';

startAdminSession();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? 'status';

    if ($method === 'GET' && $action === 'status') {
        echo json_encode([
            'authenticated' => isset($_SESSION['admin_user']),
            'user' => $_SESSION['admin_user'] ?? null,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'POST' && $action === 'login') {
        $payload = readJsonBody();
        $username = trim((string) ($payload['username'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($username === '' || $password === '') {
            respondError('Introduce usuario y contraseña.', 422);
        }

        $pdo = db();
        $statement = $pdo->prepare(
            'SELECT username, display_name, role, password_hash
             FROM admin_users
             WHERE username = :username AND active = 1
             LIMIT 1'
        );
        $statement->execute(['username' => $username]);
        $user = $statement->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            respondError('Credenciales incorrectas.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['admin_user'] = [
            'username' => $user['username'],
            'displayName' => $user['display_name'],
            'role' => $user['role'],
        ];

        echo json_encode([
            'authenticated' => true,
            'user' => $_SESSION['admin_user'],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'POST' && $action === 'logout') {
        $_SESSION = [];

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }

        echo json_encode(['authenticated' => false], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    respondError('Acción no disponible.', 404);
} catch (Throwable $exception) {
    respondError('No se pudo procesar la autenticación.', 500);
}
