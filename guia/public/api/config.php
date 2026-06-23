<?php

declare(strict_types=1);

$localConfig = __DIR__ . '/config.local.php';

if (is_file($localConfig)) {
    $config = require $localConfig;

    if (is_array($config)) {
        return $config;
    }
}

return [
    'host' => getenv('OSOSPORT_DB_HOST') ?: 'localhost',
    'port' => (int) (getenv('OSOSPORT_DB_PORT') ?: 3306),
    'database' => getenv('OSOSPORT_DB_DATABASE') ?: '',
    'username' => getenv('OSOSPORT_DB_USERNAME') ?: '',
    'password' => getenv('OSOSPORT_DB_PASSWORD') ?: '',
    'charset' => getenv('OSOSPORT_DB_CHARSET') ?: 'utf8mb4',
];
