import * as rules from './rules.js'

function isEmpty(value, field) {
  if (field.type === 'checkbox') return value !== true
  if (field.type === 'file') return !value || (Array.isArray(value) && value.length === 0)
  return value === undefined || value === null || String(value).trim() === ''
}

/**
 * Interprets a field's declarative `validation` object against a submitted
 * value, returning the first applicable error message (or null). This is
 * the client-side half of the client+server validation split (section 17):
 * it exists for UX, and the PHP generator (Phase 8) must independently
 * re-run equivalent checks server-side rather than trusting this ran.
 *
 * Fail-fast, single-message-per-field, in a fixed order: required first
 * (nothing else is checked against an empty value), then format, then
 * length/range, then pattern, then file-specific constraints.
 */
export function validateFieldValue(field, value) {
  const validation = field.validation ?? {}

  if (validation.required && isEmpty(value, field)) {
    return 'This field is required.'
  }
  if (isEmpty(value, field)) return null

  if (validation.format === 'email') {
    const error = rules.checkEmailFormat(value)
    if (error) return error
  }
  if (validation.format === 'url') {
    const error = rules.checkUrlFormat(value)
    if (error) return error
  }

  if (validation.minLength != null) {
    const error = rules.checkMinLength(value, validation.minLength)
    if (error) return error
  }
  if (validation.maxLength != null) {
    const error = rules.checkMaxLength(value, validation.maxLength)
    if (error) return error
  }

  if (validation.min != null) {
    const error =
      field.type === 'date' ? rules.checkDateMin(value, validation.min) : rules.checkNumericMin(value, validation.min)
    if (error) return error
  }
  if (validation.max != null) {
    const error =
      field.type === 'date' ? rules.checkDateMax(value, validation.max) : rules.checkNumericMax(value, validation.max)
    if (error) return error
  }

  if (validation.pattern) {
    const error = rules.checkPattern(value, validation.pattern)
    if (error) return error
  }

  if (field.type === 'file' && field.fileConfig) {
    const error = rules.checkFileConfig(value, field.fileConfig)
    if (error) return error
  }

  return null
}

/** Validates every field in a schema against a { [fieldName]: value } map. Returns { [fieldId]: message }. */
export function validateForm(schema, values) {
  const errors = {}
  for (const field of schema.fields) {
    const error = validateFieldValue(field, values[field.name])
    if (error) errors[field.id] = error
  }
  return errors
}
