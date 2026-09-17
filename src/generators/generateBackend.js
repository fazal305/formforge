import { generatePhpConfig } from './php/phpConfigGenerator.js'
import { generatePhpDatabase } from './php/phpDatabaseGenerator.js'
import { generatePhpValidation } from './php/phpValidationGenerator.js'
import { generatePhpSubmit } from './php/phpSubmitGenerator.js'

/**
 * Assembles the independent PHP generators into a file map. Layout mirrors
 * the export tree from the architecture doc: api/ for the request entry
 * point, config/ for environment-driven settings and the DB connection,
 * validation/ for the rule interpreter.
 */
export function generateBackendFiles(schema) {
  return {
    'backend/api/submit.php': generatePhpSubmit(schema),
    'backend/config/config.php': generatePhpConfig(),
    'backend/config/database.php': generatePhpDatabase(),
    'backend/validation/validation.php': generatePhpValidation(schema),
  }
}
