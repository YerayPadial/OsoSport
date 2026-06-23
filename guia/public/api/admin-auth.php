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
    $pdo = db();
    ensureUserSchema($pdo);

    if ($method === 'GET' && $action === 'status') {
        echo json_encode([
            'authenticated' => currentUserSession() !== null,
            'user' => currentUserSession(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'POST' && $action === 'login') {
        $payload = readJsonBody();
        $identifier = trim((string) ($payload['username'] ?? $payload['email'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($identifier === '' || $password === '') {
            respondError('Introduce email/usuario y contraseña.', 422);
        }

        $statement = $pdo->prepare(
            'SELECT id, username, email, first_name, last_name, display_name, role, password_hash, avatar_path, active
             FROM users
             WHERE (email = :identifier OR username = :identifier) AND active = 1
             LIMIT 1'
        );
        $statement->execute(['identifier' => $identifier]);
        $user = $statement->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            respondError('Credenciales incorrectas.', 401);
        }

        session_regenerate_id(true);
        setUserSession(publicUser($user));

        echo json_encode([
            'authenticated' => true,
            'user' => currentUserSession(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'POST' && $action === 'register') {
        $payload = readJsonBody();
        $firstName = cleanName($payload['firstName'] ?? '');
        $lastName = cleanName($payload['lastName'] ?? '');
        $email = cleanEmail($payload['email'] ?? '');
        $password = (string) ($payload['password'] ?? '');

        validateUserInput($firstName, $lastName, $email);
        validatePassword($password);

        $statement = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = :email');
        $statement->execute(['email' => $email]);

        if ((int) $statement->fetchColumn() > 0) {
            respondError('Ya existe una cuenta con ese email.', 422);
        }

        $displayName = trim($firstName . ' ' . $lastName);
        $insert = $pdo->prepare(
            'INSERT INTO users (username, email, first_name, last_name, display_name, role, password_hash, active)
             VALUES (NULL, :email, :first_name, :last_name, :display_name, "user", :password_hash, 1)'
        );
        $insert->execute([
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'display_name' => $displayName,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        $user = findUserById($pdo, (int) $pdo->lastInsertId());
        session_regenerate_id(true);
        setUserSession(publicUser($user));

        echo json_encode([
            'authenticated' => true,
            'user' => currentUserSession(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'PUT' && $action === 'profile') {
        $sessionUser = currentUserSession();

        if (!$sessionUser) {
            respondError('No autenticado.', 401);
        }

        $payload = readJsonBody();
        $firstName = cleanName($payload['firstName'] ?? '');
        $lastName = cleanName($payload['lastName'] ?? '');
        $email = cleanEmail($payload['email'] ?? '');

        validateUserInput($firstName, $lastName, $email);
        ensureUniqueEmail($pdo, $email, (int) $sessionUser['id']);

        $displayName = trim($firstName . ' ' . $lastName);
        $statement = $pdo->prepare(
            'UPDATE users
             SET first_name = :first_name, last_name = :last_name, display_name = :display_name, email = :email
             WHERE id = :id'
        );
        $statement->execute([
            'id' => (int) $sessionUser['id'],
            'first_name' => $firstName,
            'last_name' => $lastName,
            'display_name' => $displayName,
            'email' => $email,
        ]);

        $user = publicUser(findUserById($pdo, (int) $sessionUser['id']));
        setUserSession($user);

        echo json_encode(['user' => $user], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($method === 'PUT' && $action === 'password') {
        $sessionUser = currentUserSession();

        if (!$sessionUser) {
            respondError('No autenticado.', 401);
        }

        $payload = readJsonBody();
        $currentPassword = (string) ($payload['currentPassword'] ?? '');
        $newPassword = (string) ($payload['newPassword'] ?? '');
        $user = findUserById($pdo, (int) $sessionUser['id']);

        if (!password_verify($currentPassword, $user['password_hash'])) {
            respondError('La contraseña actual no es correcta.', 422);
        }

        validatePassword($newPassword);

        if (password_verify($newPassword, $user['password_hash'])) {
            respondError('La contraseña nueva debe ser distinta a la actual.', 422);
        }

        $statement = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $statement->execute([
            'id' => (int) $sessionUser['id'],
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        ]);

        echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
} catch (InvalidArgumentException $exception) {
    respondError($exception->getMessage(), 422);
} catch (Throwable $exception) {
    respondError('No se pudo procesar la autenticación.', 500);
}

function findUserById(PDO $pdo, int $id): array
{
    $statement = $pdo->prepare(
        'SELECT id, username, email, first_name, last_name, display_name, role, password_hash, avatar_path, active
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
