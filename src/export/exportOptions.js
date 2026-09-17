/**
 * What actually ships in the exported project — chosen independently of
 * what the generators are capable of. A user exporting a static contact
 * form has no reason to receive a PHP backend they'll never deploy.
 */
export function createDefaultExportOptions(schema) {
  return {
    frontend: true,
    jsonSchema: true,
    backend: schema.settings.storeSubmissions ? 'php' : 'none',
    database: schema.settings.storeSubmissions ? 'mysql' : 'none',
  }
}
