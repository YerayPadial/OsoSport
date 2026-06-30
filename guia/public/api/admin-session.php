<?php

declare(strict_types=1);

function startAdminSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $cookiePath = adminSessionCookiePath();

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => $cookiePath,
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    expireLegacyAdminSessionCookies();
    session_name(adminSessionCookieName());
    session_start();
}

function currentUserSession(): ?array
{
    return $_SESSION['user'] ?? $_SESSION['admin_user'] ?? null;
}

function setUserSession(array $user): void
{
    $_SESSION['user'] = $user;
    $_SESSION['admin_user'] = $user;
}

function rememberCurrentSession(bool $remember): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $cookiePath = adminSessionCookiePath();

    setcookie(session_name(), session_id(), [
        'expires' => $remember ? time() + (30 * 24 * 60 * 60) : 0,
        'path' => $cookiePath,
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clearCurrentAdminSessionCookie(): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    setcookie(adminSessionCookieName(), '', [
        'expires' => time() - 3600,
        'path' => adminSessionCookiePath(),
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function expireLegacyAdminSessionCookies(): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $currentName = adminSessionCookieName();
    $legacyNames = getenv('OSOSPORT_LEGACY_SESSION_COOKIES') ?: 'ososport_admin';
    $cookiePath = adminSessionCookiePath();

    foreach (array_filter(array_map('trim', explode(',', $legacyNames))) as $legacyName) {
        if ($legacyName === '' || $legacyName === $currentName) {
            continue;
        }

        setcookie($legacyName, '', [
            'expires' => time() - 3600,
            'path' => $cookiePath,
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}

function adminSessionCookieName(): string
{
    $version = preg_replace('/[^a-zA-Z0-9_-]/', '', getenv('OSOSPORT_SESSION_COOKIE_VERSION') ?: 'v2') ?: 'v2';

    return 'ososport_admin_' . $version;
}

function adminSessionCookiePath(): string
{
    return getenv('OSOSPORT_COOKIE_PATH') ?: rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
}

function readJsonBody(): array
{
    $body = file_get_contents('php://input') ?: '';
    $payload = json_decode($body, true);

    if (!is_array($payload)) {
        respondError('JSON inválido.', 400);
    }

    return $payload;
}

function respondError(string $message, int $status): never
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
