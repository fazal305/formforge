import { CURRENT_SCHEMA_VERSION } from './schemaVersion.js'
import { isRegisteredFieldType } from './fieldRegistry.js'
import { isValidIdentifier } from './identifier.js'

/**
 * Structural validation for any schema entering the app from outside its
 * own reducer — an imported JSON file, a future AI-generated schema, a
 * localStorage read after a manual edit. Never trust that shape; a
 * malformed schema must fail here with a specific reason, not surface as a
 * cryptic crash three components later.
 */
export function validateSchema(candidate) {
  const errors = []

  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return { valid: false, errors: ['Schema must be a JSON object.'] }
  }

  if (candidate.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schema version "${candidate.schemaVersion}" (expected ${CURRENT_SCHEMA_VERSION}). This file may be from a different FormForge version.`,
    )
    // Shape below almost certainly won't match either — no point checking further.
    return { valid: false, errors }
  }

  if (typeof candidate.id !== 'string' || !candidate.id) errors.push('Missing form id.')
  if (typeof candidate.name !== 'string' || !candidate.name) errors.push('Missing form name.')

  if (typeof candidate.settings !== 'object' || candidate.settings === null) {
    errors.push('Missing form settings.')
  } else {
    const { method, action, layout } = candidate.settings
    if (method !== undefined && !['GET', 'POST'].includes(method)) {
      errors.push(`Invalid settings.method "${method}".`)
    }
    if (action !== undefined && typeof action !== 'string') {
      errors.push('settings.action must be a string.')
    }
    if (layout !== undefined && !['single-column', 'two-column'].includes(layout)) {
      errors.push(`Invalid settings.layout "${layout}".`)
    }
  }

  if (!Array.isArray(candidate.fields)) {
    errors.push('fields must be an array.')
    return { valid: errors.length === 0, errors }
  }

  const seenIds = new Set()
  const seenNames = new Set()

  candidate.fields.forEach((field, index) => {
    const where = `fields[${index}]`

    if (typeof field !== 'object' || field === null) {
      errors.push(`${where} must be an object.`)
      return
    }
    if (typeof field.id !== 'string' || !field.id) {
      errors.push(`${where}.id is required.`)
    } else if (seenIds.has(field.id)) {
      errors.push(`${where}.id "${field.id}" is duplicated.`)
    } else {
      seenIds.add(field.id)
    }

    if (!isRegisteredFieldType(field.type)) {
      errors.push(`${where}.type "${field.type}" is not a known field type.`)
    }

    if (!isValidIdentifier(field.name)) {
      errors.push(`${where}.name "${field.name}" is not a valid field name.`)
    } else if (seenNames.has(field.name)) {
      errors.push(`${where}.name "${field.name}" is duplicated — field names must be unique.`)
    } else {
      seenNames.add(field.name)
    }

    if (typeof field.label !== 'string') {
      errors.push(`${where}.label must be a string.`)
    }

    if (field.options !== undefined && !Array.isArray(field.options)) {
      errors.push(`${where}.options must be an array.`)
    }
  })

  return { valid: errors.length === 0, errors }
}
