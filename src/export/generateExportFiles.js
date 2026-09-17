import { generateFrontendFiles } from '../generators/generateFrontend.js'
import { generateBackendFiles } from '../generators/generateBackend.js'
import { generateDatabaseFiles } from '../generators/generateDatabase.js'
import { generateJsonSchema } from '../generators/jsonSchemaGenerator.js'
import { generateReadme } from '../generators/readmeGenerator.js'

/**
 * The only place export options actually gate which generators run. Every
 * generator itself stays option-agnostic (section 27) — this function is
 * the one spot that decides inclusion, so it's the one spot that needs to
 * change if a new export toggle is ever added.
 */
export function generateExportFiles(schema, options) {
  let files = {}

  if (options.frontend) {
    files = { ...files, ...generateFrontendFiles(schema) }
    if (!options.jsonSchema) {
      delete files['schema/form.schema.json']
    }
  } else if (options.jsonSchema) {
    // JSON Schema can be requested independently of the HTML/CSS/JS frontend.
    files['schema/form.schema.json'] = generateJsonSchema(schema)
  }

  if (options.backend === 'php') {
    files = { ...files, ...generateBackendFiles(schema) }
  }

  if (options.database === 'mysql') {
    files = { ...files, ...generateDatabaseFiles(schema) }
  }

  files['README.md'] = generateReadme(schema, options)

  return files
}
