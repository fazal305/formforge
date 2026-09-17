import { CURRENT_SCHEMA_VERSION } from './schemaVersion.js'
import { getFieldDefinition } from './fieldRegistry.js'
import { toSafeIdentifier, ensureUniqueIdentifier } from './identifier.js'

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyForm(name = 'Untitled form') {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: generateId('form'),
    name,
    description: '',
    settings: {
      submitLabel: 'Submit',
      successMessage: "Thanks — we'll be in touch.",
      errorMessage: 'Something went wrong. Please try again.',
      method: 'POST',
      action: '/api/forms/submit',
      layout: 'single-column',
      storeSubmissions: false,
    },
    fields: [],
  }
}

/**
 * Builds a full field object for `type` from its registry defaults, ready
 * to append to a schema's `fields` array. `existingNames` is used to keep
 * the auto-generated `name` collision-free within the form.
 */
export function createField(type, { existingNames = [], order = 0 } = {}) {
  const definition = getFieldDefinition(type)
  if (!definition) throw new Error(`Unknown field type: ${type}`)

  const baseName = toSafeIdentifier(definition.label, definition.type)
  const name = ensureUniqueIdentifier(baseName, existingNames)

  return {
    id: generateId('field'),
    type: definition.type,
    name,
    label: definition.label,
    order,
    visibility: null,
    options: [],
    fileConfig: null,
    layout: { width: 'full' },
    a11y: { describedBy: null },
    ...definition.defaultConfig(),
  }
}
