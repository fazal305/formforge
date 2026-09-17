import { getTableName } from '../tableName.js'
import { buildColumnMapping } from './columnMapping.js'

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]{0,62}$/

/**
 * Table and column names come from FormForge's own identifier allowlist
 * (schema/identifier.js) already, at schema-authoring time — this check is
 * defense in depth, not the primary safeguard. Submitted *values* are never
 * part of this file at all; those are bound as PDO parameters at request
 * time (backend/config/database.php), never interpolated into SQL text.
 */
function assertSafeIdentifier(name) {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Refusing to generate SQL for unsafe identifier: "${name}"`)
  }
  return name
}

export function generateSql(schema) {
  const table = assertSafeIdentifier(getTableName(schema))
  const mapping = buildColumnMapping(schema).filter((entry) => entry.stored)

  const columnLines = mapping.map((entry) => {
    const column = assertSafeIdentifier(entry.column)
    const nullability = entry.nullable ? 'NULL' : 'NOT NULL'
    return `  \`${column}\` ${entry.sqlType} ${nullability}`
  })

  const lines = [
    `  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
    ...columnLines,
    `  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  ]

  const skipped = buildColumnMapping(schema).filter((entry) => !entry.stored)
  const skippedComment = skipped.length
    ? skipped.map((entry) => `-- Skipped: \`${entry.field}\` (${entry.note})`).join('\n') + '\n'
    : ''

  return `${skippedComment}CREATE TABLE IF NOT EXISTS \`${table}\` (
${lines.join(',\n')}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`
}
