import { generateFrontendFiles } from './generateFrontend.js'
import { generateBackendFiles } from './generateBackend.js'
import { generateDatabaseFiles } from './generateDatabase.js'

/**
 * Combines the independent generators into one file map. No option-gating
 * here yet — which files actually ship in an export is an Export
 * Configuration concern (section 27), a later phase; the Code Viewer shows
 * everything the generators are currently capable of producing.
 */
export function generateProjectFiles(schema) {
  return {
    ...generateFrontendFiles(schema),
    ...generateBackendFiles(schema),
    ...generateDatabaseFiles(schema),
  }
}
