<?php

declare(strict_types=1);

require __DIR__ . '/repository.php';
require __DIR__ . '/admin-session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

startAdminSession();

$sessionUser = currentUserSession();

if (!$sessionUser) {
    respondError('No autenticado.', 401);
}

if (($sessionUser['role'] ?? 'user') !== 'admin') {
    respondError('No autorizado.', 403);
}

try {
    $pdo = db();
    ensureUserSchema($pdo);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $users = $pdo->query(
            'SELECT id, username, email, first_name, last_name, display_name, role, avatar_path, active
             FROM users
             ORDER BY role = "admin" DESC, display_name, id'
        )->fetchAll();

        echo json_encode(['users' => array_map('publicUser', $users)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'POST') {
        $payload = readJsonBody();
        $firstName = cleanName($payload['firstName'] ?? '');
        $lastName = cleanName($payload['lastName'] ?? '');
        $email = cleanEmail($payload['email'] ?? '');
        $role = normalizeRole($payload['role'] ?? 'user');
        $password = (string) ($payload['password'] ?? '');

        validateUserInput($firstName, $lastName, $email);
        validatePassword($password);
        ensureUniqueEmail($pdo, $email, 0);

        $displayName = trim($firstName . ' ' . $lastName);
        $statement = $pdo->prepare(
            'INSERT INTO users (username, email, first_name, last_name, display_name, role, password_hash, active)
             VALUES (NULL, :email, :first_name, :last_name, :display_name, :role, :password_hash, 1)'
        );
        $statement->execute([
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'display_name' => $displayName,
            'role' => $role,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        echo json_encode(['user' => publicUser(adminFindUserById($pdo, (int) $pdo->lastInsertId()))], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'PUT') {
        $payload = readJsonBody();
        $id = requiredPayloadId($payload);
        $firstName = cleanName($payload['firstName'] ?? '');
        $lastName = cleanName($payload['lastName'] ?? '');
        $email = cleanEmail($payload['email'] ?? '');
        $role = normalizeRole($payload['role'] ?? 'user');
        $active = !empty($payload['active']) ? 1 : 0;
        $password = (string) ($payload['password'] ?? '');

        validateUserInput($firstName, $lastName, $email);
        ensureUniqueEmail($pdo, $email, $id);

        if ($id === (int) $sessionUser['id'] && ($role !== 'admin' || !$active)) {
            respondError('No puedes quitarte tu propio acceso admin.', 422);
        }

        $displayName = trim($firstName . ' ' . $lastName);
        $statement = $pdo->prepare(
            'UPDATE users
             SET email = :email, first_name = :first_name, last_name = :last_name, display_name = :display_name, role = :role, active = :active
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'display_name' => $displayName,
            'role' => $role,
            'active' => $active,
        ]);

        if ($password !== '') {
            validatePassword($password);
            $passwordStatement = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
            $passwordStatement->execute([
                'id' => $id,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
        }

        $user = publicUser(adminFindUserById($pdo, $id));

        if ($id === (int) $sessionUser['id']) {
            setUserSession($user);
        }

        echo json_encode(['user' => $user], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int) ($_GET['id'] ?? 0);

        if ($id <= 0) {
            respondError('Usuario no válido.', 422);
        }

        if ($id === (int) $sessionUser['id']) {
            respondError('No puedes eliminar tu propio usuario.', 422);
        }

        $statement = $pdo->prepare('DELETE FROM users WHERE id = :id');
        $statement->execute(['id' => $id]);

        echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    respondError('Método no permitido.', 405);
} catch (InvalidArgumentException $exception) {
    respondError($exception->getMessage(), 422);
} catch (Throwable $exception) {
    respondError('No se pudo gestionar usuarios.', 500);
}

function adminFindUserById(PDO $pdo, int $id): array
{
    $statement = $pdo->prepare(
        'SELECT id, username, email, first_name, last_name, display_name, role, avatar_path, active
         FROM users
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $id]);
    $user = $statement->fetch();

    if (!$user) {
        respondError('Usuario no encontrado.', 404);
    }

    return $user;
}

function requiredPayloadId(array $payload): int
{
    $id = (int) ($payload['id'] ?? 0);

    if ($id <= 0) {
        respondError('Usuario no válido.', 422);
    }

    return $id;
}

function normalizeRole(mixed $role): string
{
    $role = (string) $role;

    if (!in_array($role, ['admin', 'user'], true)) {
        throw new InvalidArgumentException('Rol no válido.');
    }

    return $role;
}

function cleanName(mixed $value): string
{
    $name = preg_replace('/\s+/', ' ', trim((string) $value)) ?? '';

    if ($name !== strip_tags($name)) {
        throw new InvalidArgumentException('El nombre no puede contener HTML.');
    }

    return $name;
}

function cleanEmail(mixed $value): string
{
    return strtolower(trim((string) $value));
}

function validateUserInput(string $firstName, string $lastName, string $email): void
{
    if ($firstName === '' || strlen($firstName) < 2 || strlen($firstName) > 100) {
        throw new InvalidArgumentException('El nombre debe tener entre 2 y 100 caracteres.');
    }

    if ($lastName === '' || strlen($lastName) < 2 || strlen($lastName) > 140) {
        throw new InvalidArgumentException('Los apellidos deben tener entre 2 y 140 caracteres.');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        throw new InvalidArgumentException('Introduce un email válido.');
    }
}

function validatePassword(string $password): void
{
    if (strlen($password) < 10 || strlen($password) > 72) {
        throw new InvalidArgumentException('La contraseña debe tener entre 10 y 72 caracteres.');
    }

    if (!preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password) || !preg_match('/\d/', $password)) {
        throw new InvalidArgumentException('La contraseña debe incluir mayúsculas, minúsculas y números.');
    }
}

function ensureUniqueEmail(PDO $pdo, string $email, int $userId): void
{
    $statement = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = :email AND id <> :id');
    $statement->execute(['email' => $email, 'id' => $userId]);

    if ((int) $statement->fetchColumn() > 0) {
        throw new InvalidArgumentException('Ya existe una cuenta con ese email.');
    }
}
