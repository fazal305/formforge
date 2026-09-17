/**
 * Reads all configuration from environment variables, with local-dev
 * fallbacks only — never a hardcoded credential (section 85). The uploads
 * directory is deliberately outside any web-servable path so an uploaded
 * file can never be requested (and therefore never executed) directly by
 * URL (section 60).
 */
export function generatePhpConfig() {
  return `<?php
declare(strict_types=1);

/**
 * Configuration is read from environment variables so credentials are never
 * committed to source control. Set these in your hosting environment or a
 * .env loader of your choice — this file does not read .env itself to avoid
 * adding a dependency the generated project may not need.
 */
return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'formforge',
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
    ],
    'uploads' => [
        // Outside the web root by default: a file here cannot be requested,
        // and therefore cannot be executed, directly by URL.
        'directory' => getenv('UPLOAD_DIR') ?: (__DIR__ . '/../../uploads'),
    ],
    'cors' => [
        'allowed_origin' => getenv('CORS_ALLOWED_ORIGIN') ?: '*',
    ],
];
`
}
