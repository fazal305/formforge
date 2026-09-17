import text from './fields/text.js'
import email from './fields/email.js'
import password from './fields/password.js'
import number from './fields/number.js'
import phone from './fields/phone.js'
import url from './fields/url.js'
import textarea from './fields/textarea.js'
import select from './fields/select.js'
import radio from './fields/radio.js'
import checkbox from './fields/checkbox.js'
import date from './fields/date.js'
import time from './fields/time.js'
import file from './fields/file.js'
import hidden from './fields/hidden.js'

/**
 * The registry is the single place a field type's shape is declared.
 * Everything downstream (properties panel, preview, validation, generators)
 * reads from here instead of special-casing a type by name — adding a new
 * field type means adding one module here, not touching N components.
 */
const registry = [
  text,
  email,
  password,
  number,
  phone,
  url,
  textarea,
  select,
  radio,
  checkbox,
  date,
  time,
  file,
  hidden,
].reduce((acc, definition) => {
  acc[definition.type] = definition
  return acc
}, {})

export function getFieldDefinition(type) {
  return registry[type] ?? null
}

export function isRegisteredFieldType(type) {
  return Object.prototype.hasOwnProperty.call(registry, type)
}

export function listFieldDefinitions() {
  return Object.values(registry)
}

export function listFieldDefinitionsByCategory() {
  const byCategory = {}
  for (const definition of Object.values(registry)) {
    if (!byCategory[definition.category]) byCategory[definition.category] = []
    byCategory[definition.category].push(definition)
  }
  return byCategory
}

export function fieldHasCapability(type, capability) {
  return getFieldDefinition(type)?.capabilities.includes(capability) ?? false
}
