import { generateSql } from './sql/sqlGenerator.js'

export function generateDatabaseFiles(schema) {
  return {
    'database/schema.sql': generateSql(schema),
  }
}
