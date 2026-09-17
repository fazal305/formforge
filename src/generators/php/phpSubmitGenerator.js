import { encodePhpValue, encodePhpString } from './phpValueSerializer.js'
import { getTableName } from '../tableName.js'

/**
 * The request entry point. Parses input, re-validates everything server
 * side regardless of what the client already checked, handles file uploads
 * with their own security checks (never trusting client-declared name or
 * MIME type), stores a submission via prepared statements if enabled, and
 * always responds with JSON and an appropriate status code.
 */
export function generatePhpSubmit(schema) {
  const uploadFields = schema.fields
    .filter((f) => f.type === 'file')
    .map((f) => ({ name: f.name, validation: f.validation ?? {}, fileConfig: f.fileConfig ?? {} }))

  const storableFields = schema.fields.filter((f) => f.type !== 'file')
  const columnNames = [...storableFields.map((f) => f.name), ...uploadFields.map((f) => f.name)]

  const tableName = getTableName(schema)

  return `<?php
declare(strict_types=1);

header('Content-Type: application/json');

$config = require __DIR__ . '/../config/config.php';
header('Access-Control-Allow-Origin: ' . $config['cors']['allowed_origin']);

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Allow-Methods: ${schema.settings.method}, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== ${encodePhpString(schema.settings.method)}) {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['_form' => 'Method not allowed.']]);
    exit;
}

require __DIR__ . '/../validation/validation.php';
require __DIR__ . '/../config/database.php';

const FORMFORGE_STORE_SUBMISSIONS = ${schema.settings.storeSubmissions ? 'true' : 'false'};
const FORMFORGE_TABLE_NAME = ${encodePhpString(tableName)};
const FORMFORGE_COLUMNS = ${encodePhpValue(columnNames)};
const FORMFORGE_UPLOAD_FIELDS = ${encodePhpValue(uploadFields)};

/**
 * File-specific security lives here, next to where the file is actually
 * written — never trust the client-declared filename or MIME type.
 */
function formforge_is_safe_upload_extension(string $extension): bool
{
    $dangerous = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'exe', 'sh', 'bat', 'cmd', 'js', 'jsp', 'asp', 'aspx', 'cgi', 'pl', 'py'];
    return !in_array($extension, $dangerous, true);
}

function formforge_handle_upload(array $file, array $fileConfig, string $uploadDir): array
{
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'The file could not be uploaded.'];
    }

    $maxSize = $fileConfig['maxSizeBytes'] ?? null;
    if ($maxSize !== null && $file['size'] > $maxSize) {
        $maxMb = (int) round($maxSize / (1024 * 1024));
        return ['error' => "File must be smaller than {$maxMb} MB."];
    }

    $allowedExtensions = array_filter(array_map('trim', explode(',', strtolower($fileConfig['accept'] ?? ''))));
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $extensionWithDot = $extension !== '' ? ".{$extension}" : '';

    if (!empty($allowedExtensions) && !in_array($extensionWithDot, $allowedExtensions, true)) {
        return ['error' => 'Only these file types are allowed: ' . ($fileConfig['accept'] ?? '')];
    }

    if (!formforge_is_safe_upload_extension($extension)) {
        return ['error' => 'This file type is not allowed.'];
    }

    // Never trust the client-declared MIME type — sniff it server-side.
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo ? finfo_file($finfo, $file['tmp_name']) : false;
    if ($finfo) {
        finfo_close($finfo);
    }
    if ($detectedMime === false) {
        return ['error' => 'This file type could not be verified.'];
    }

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        return ['error' => 'The server could not store the uploaded file.'];
    }

    // Random filename — never the client-supplied one (path traversal, overwrite, or execution risk).
    $storedName = bin2hex(random_bytes(16)) . $extensionWithDot;
    $destination = rtrim($uploadDir, '/\\\\') . DIRECTORY_SEPARATOR . $storedName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return ['error' => 'The server could not store the uploaded file.'];
    }

    return ['storedName' => $storedName];
}

// --- Parse input: JSON body or multipart form data ---
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $decoded = json_decode((string) file_get_contents('php://input'), true);
    $data = is_array($decoded) ? $decoded : [];
} else {
    $data = $_POST;
}

$errors = formforge_validate_all(FORMFORGE_FIELDS, $data);

// --- File fields: validated and stored independently of formforge_validate_all() ---
$uploadedFiles = [];
foreach (FORMFORGE_UPLOAD_FIELDS as $fileField) {
    $name = $fileField['name'];
    $hasFile = isset($_FILES[$name]) && $_FILES[$name]['error'] !== UPLOAD_ERR_NO_FILE;

    if (!$hasFile) {
        if (!empty($fileField['validation']['required'] ?? false)) {
            $errors[$name] = 'This field is required.';
        }
        continue;
    }

    $result = formforge_handle_upload($_FILES[$name], $fileField['fileConfig'] ?? [], $config['uploads']['directory']);
    if (isset($result['error'])) {
        $errors[$name] = $result['error'];
    } else {
        $uploadedFiles[$name] = $result['storedName'];
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// --- Store the submission, if enabled ---
if (FORMFORGE_STORE_SUBMISSIONS) {
    try {
        $pdo = formforge_get_pdo($config);
        $values = array_map(
            static function (string $column) use ($data, $uploadedFiles): mixed {
                if (array_key_exists($column, $uploadedFiles)) {
                    return $uploadedFiles[$column];
                }
                $value = $data[$column] ?? null;
                if (is_bool($value)) {
                    return $value ? 1 : 0;
                }
                if (is_array($value)) {
                    return json_encode($value);
                }
                return $value;
            },
            FORMFORGE_COLUMNS
        );

        formforge_insert_submission($pdo, FORMFORGE_TABLE_NAME, FORMFORGE_COLUMNS, $values);
    } catch (\\PDOException $e) {
        error_log('FormForge submission insert failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'errors' => ['_form' => 'Something went wrong. Please try again later.']]);
        exit;
    }
}

http_response_code(200);
echo json_encode(['success' => true]);
`
}
