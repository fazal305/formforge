import { encodePhpValue } from './phpValueSerializer.js'

/**
 * The server-side half of the client+server validation split (section 17).
 * This is a deliberate re-implementation of the same declarative rules as
 * src/validation/rules.js and the generated script.js — never assume the
 * browser already validated anything; a request can come from curl, not
 * just the generated form.
 *
 * File fields are validated separately in submit.php, alongside the upload
 * handling itself (extension/size/MIME checks belong next to where the
 * file is actually written to disk).
 */
export function generatePhpValidation(schema) {
  const fieldsMeta = schema.fields
    .filter((f) => f.type !== 'hidden' && f.type !== 'file')
    .map((f) => ({
      name: f.name,
      type: f.type,
      validation: f.validation ?? {},
    }))

  return `<?php
declare(strict_types=1);

const FORMFORGE_FIELDS = ${encodePhpValue(fieldsMeta)};

function formforge_is_empty($field, $value): bool
{
    if ($field['type'] === 'checkbox') {
        return $value !== true && $value !== 'true' && $value !== '1' && $value !== 1;
    }
    return $value === null || (is_string($value) && trim($value) === '');
}

function formforge_check_email(string $value): ?string
{
    return filter_var($value, FILTER_VALIDATE_EMAIL) !== false ? null : 'Enter a valid email address.';
}

function formforge_check_url(string $value): ?string
{
    return filter_var($value, FILTER_VALIDATE_URL) !== false ? null : 'Enter a valid URL, including https://.';
}

function formforge_check_min_length(string $value, int $min): ?string
{
    return mb_strlen($value) < $min ? "Must be at least {$min} characters." : null;
}

function formforge_check_max_length(string $value, int $max): ?string
{
    return mb_strlen($value) > $max ? "Must be no more than {$max} characters." : null;
}

function formforge_check_numeric_min($value, $min): ?string
{
    if (!is_numeric($value)) return 'Enter a number.';
    return (float) $value < (float) $min ? "Must be at least {$min}." : null;
}

function formforge_check_numeric_max($value, $max): ?string
{
    if (!is_numeric($value)) return 'Enter a number.';
    return (float) $value > (float) $max ? "Must be no more than {$max}." : null;
}

function formforge_check_date_min(string $value, string $min): ?string
{
    $date = strtotime($value);
    $minDate = strtotime($min);
    if ($date === false || $minDate === false) return 'Enter a valid date.';
    return $date < $minDate ? "Date must be on or after {$min}." : null;
}

function formforge_check_date_max(string $value, string $max): ?string
{
    $date = strtotime($value);
    $maxDate = strtotime($max);
    if ($date === false || $maxDate === false) return 'Enter a valid date.';
    return $date > $maxDate ? "Date must be on or before {$max}." : null;
}

function formforge_check_pattern(string $value, string $pattern): ?string
{
    $result = @preg_match('/' . str_replace('/', '\\/', $pattern) . '/', $value);
    if ($result === false) return null; // malformed pattern fails safe, same as the client-side engine
    return $result === 1 ? null : 'Value does not match the required format.';
}

function formforge_validate_field(array $field, $value): ?string
{
    $validation = $field['validation'] ?? [];

    if (!empty($validation['required']) && formforge_is_empty($field, $value)) {
        return 'This field is required.';
    }
    if (formforge_is_empty($field, $value)) {
        return null;
    }

    $stringValue = is_string($value) ? $value : (string) $value;

    if (($validation['format'] ?? null) === 'email') {
        $error = formforge_check_email($stringValue);
        if ($error) return $error;
    }
    if (($validation['format'] ?? null) === 'url') {
        $error = formforge_check_url($stringValue);
        if ($error) return $error;
    }
    if (isset($validation['minLength'])) {
        $error = formforge_check_min_length($stringValue, (int) $validation['minLength']);
        if ($error) return $error;
    }
    if (isset($validation['maxLength'])) {
        $error = formforge_check_max_length($stringValue, (int) $validation['maxLength']);
        if ($error) return $error;
    }
    if (isset($validation['min'])) {
        $error = $field['type'] === 'date'
            ? formforge_check_date_min($stringValue, (string) $validation['min'])
            : formforge_check_numeric_min($value, $validation['min']);
        if ($error) return $error;
    }
    if (isset($validation['max'])) {
        $error = $field['type'] === 'date'
            ? formforge_check_date_max($stringValue, (string) $validation['max'])
            : formforge_check_numeric_max($value, $validation['max']);
        if ($error) return $error;
    }
    if (!empty($validation['pattern'])) {
        $error = formforge_check_pattern($stringValue, (string) $validation['pattern']);
        if ($error) return $error;
    }

    return null;
}

/** @return array<string, string> errors keyed by field name */
function formforge_validate_all(array $fields, array $data): array
{
    $errors = [];
    foreach ($fields as $field) {
        $value = $data[$field['name']] ?? null;
        $error = formforge_validate_field($field, $value);
        if ($error !== null) {
            $errors[$field['name']] = $error;
        }
    }
    return $errors;
}
`
}
