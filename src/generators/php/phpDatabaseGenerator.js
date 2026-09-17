/**
 * A thin PDO wrapper. Every query in the generated project goes through
 * prepared statements with bound parameters — table/column identifiers are
 * never interpolated from request data, only from schema-generation-time
 * constants that already passed FormForge's own identifier allowlist
 * (section 58). Backticks around identifiers here are defense in depth,
 * not the primary protection.
 */
export function generatePhpDatabase() {
  return `<?php
declare(strict_types=1);

function formforge_get_pdo(array $config): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $config['db']['host'],
        $config['db']['port'],
        $config['db']['name'],
        $config['db']['charset']
    );

    return new PDO($dsn, $config['db']['user'], $config['db']['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

/**
 * $table and $columns come from generation-time constants (already validated
 * identifiers), never from request input — only the bound $values do.
 */
function formforge_insert_submission(PDO $pdo, string $table, array $columns, array $values): void
{
    $quotedColumns = array_map(static fn (string $c): string => "\`{$c}\`", $columns);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));

    $sql = sprintf('INSERT INTO \`%s\` (%s) VALUES (%s)', $table, implode(', ', $quotedColumns), $placeholders);

    $statement = $pdo->prepare($sql);
    $statement->execute(array_values($values));
}
`
}
