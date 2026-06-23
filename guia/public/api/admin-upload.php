<?php

declare(strict_types=1);

require __DIR__ . '/admin-session.php';
require __DIR__ . '/repository.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

startAdminSession();

$sessionUser = currentUserSession();

if (!$sessionUser) {
    respondError('No autenticado.', 401);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respondError('Método no permitido.', 405);
}

$kind = $_POST['kind'] ?? '';
$file = $_FILES['file'] ?? null;

if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    respondError('No se recibió ningún archivo válido.', 422);
}

$rules = [
    'thumbnail' => [
        'directory' => dirname(__DIR__) . '/thumbnails',
        'publicPath' => '/thumbnails',
        'maxSize' => 4 * 1024 * 1024,
        'mimeToExtension' => [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ],
    ],
    'avatar' => [
        'directory' => dirname(__DIR__) . '/avatars',
        'publicPath' => '/avatars',
        'maxSize' => 3 * 1024 * 1024,
        'mimeToExtension' => [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ],
    ],
    'video' => [
        'directory' => dirname(__DIR__) . '/videos',
        'publicPath' => '/videos',
        'maxSize' => 50 * 1024 * 1024,
        'mimeToExtension' => [
            'video/mp4' => 'mp4',
            'video/webm' => 'webm',
            'video/quicktime' => 'mov',
        ],
    ],
];

if (!isset($rules[$kind])) {
    respondError('Tipo de archivo no permitido.', 422);
}

if ($kind !== 'avatar' && (($sessionUser['role'] ?? 'user') !== 'admin')) {
    respondError('No autorizado.', 403);
}

$rule = $rules[$kind];

if (($file['size'] ?? 0) > $rule['maxSize']) {
    respondError('El archivo supera el tamaño permitido.', 422);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$extension = $rule['mimeToExtension'][$mime] ?? null;

if ($extension === null) {
    respondError('Formato de archivo no permitido.', 422);
}

if (!is_dir($rule['directory']) && !mkdir($rule['directory'], 0755, true)) {
    respondError('No se pudo preparar la carpeta de subida.', 500);
}

$baseName = pathinfo((string) $file['name'], PATHINFO_FILENAME);
$safeName = preg_replace('/[^a-z0-9]+/i', '-', strtolower($baseName)) ?: $kind;
$safeName = trim($safeName, '-');
$filename = sprintf('%s-%s.%s', $safeName, date('YmdHis'), $extension);
$target = $rule['directory'] . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    respondError('No se pudo guardar el archivo.', 500);
}

if ($kind === 'avatar') {
    $pdo = db();
    ensureUserSchema($pdo);
    $statement = $pdo->prepare('UPDATE users SET avatar_path = :avatar_path WHERE id = :id');
    $statement->execute([
        'id' => (int) $sessionUser['id'],
        'avatar_path' => $rule['publicPath'] . '/' . $filename,
    ]);

    $sessionUser['avatarPath'] = $rule['publicPath'] . '/' . $filename;
    setUserSession($sessionUser);
}

echo json_encode([
    'path' => $rule['publicPath'] . '/' . $filename,
    'mime' => $mime,
    'size' => (int) $file['size'],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
