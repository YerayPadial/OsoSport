<?php

declare(strict_types=1);

require __DIR__ . '/repository.php';
require __DIR__ . '/admin-session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

startAdminSession();

if (!isset($_SESSION['admin_user'])) {
    respondError('No autenticado.', 401);
}

if (($_SESSION['admin_user']['role'] ?? 'user') !== 'admin') {
    respondError('No autorizado.', 403);
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $pdo = db();

    if ($method === 'GET') {
        echo json_encode(loadAllContent($pdo), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'PUT' || $method === 'POST') {
        $payload = readJsonBody();
        replaceAllContent($pdo, $payload);

        echo json_encode([
            'ok' => true,
            'content' => loadAllContent($pdo),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    respondError('Método no permitido.', 405);
} catch (InvalidArgumentException $exception) {
    respondError($exception->getMessage(), 422);
} catch (Throwable $exception) {
    respondError('No se pudo guardar el contenido.', 500);
}
