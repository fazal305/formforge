import { toSafeIdentifier } from '../schema/identifier.js'

/**
 * The single source of the submissions table name — used by both the PHP
 * generator's INSERT statement and the SQL generator's CREATE TABLE, so
 * they can never drift apart and reference different tables (section 32).
 */
export function getTableName(schema) {
  return `${toSafeIdentifier(schema.name, 'form')}_submissions`
}
