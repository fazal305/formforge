import { generateHtml } from './htmlGenerator.js'
import { generateCss } from './cssGenerator.js'
import { generateJs } from './jsGenerator.js'
import { generateJsonSchema } from './jsonSchemaGenerator.js'

/**
 * Each generator is an independent pure function; this just assembles their
 * output into a file map. No generator calls another, and nothing here
 * inspects field types itself — that stays inside each generator/registry.
 */
export function generateFrontendFiles(schema) {
  return {
    'frontend/index.html': generateHtml(schema),
    'frontend/styles.css': generateCss(schema),
    'frontend/script.js': generateJs(schema),
    'schema/form.schema.json': generateJsonSchema(schema),
  }
}
