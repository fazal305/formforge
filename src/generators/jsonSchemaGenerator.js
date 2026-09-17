/**
 * Transforms the FormForge schema into a standard JSON Schema document —
 * a real transformation, not a dump of internal FormForge shape (section 18).
 * Consumers of this file (API clients, other tools) should never need to
 * know FormForge's own field-registry conventions.
 */
function fieldToProperty(field) {
  switch (field.type) {
    case 'email':
      return { type: 'string', format: 'email' }
    case 'url':
      return { type: 'string', format: 'uri' }
    case 'date':
      return { type: 'string', format: 'date' }
    case 'time':
      return { type: 'string', format: 'time' }
    case 'number': {
      const property = { type: 'number' }
      if (field.validation?.min != null) property.minimum = field.validation.min
      if (field.validation?.max != null) property.maximum = field.validation.max
      return property
    }
    case 'checkbox':
      return { type: 'boolean' }
    case 'select':
    case 'radio':
      return { type: 'string', enum: field.options.map((opt) => opt.value) }
    case 'file':
      return {
        type: 'string',
        description: 'File upload — represented as a filename/reference, not the binary content.',
      }
    case 'text':
    case 'textarea':
    case 'password':
    case 'phone':
    case 'hidden':
    default: {
      const property = { type: 'string' }
      if (field.validation?.minLength != null) property.minLength = field.validation.minLength
      if (field.validation?.maxLength != null) property.maxLength = field.validation.maxLength
      if (field.validation?.pattern) property.pattern = field.validation.pattern
      return property
    }
  }
}

export function generateJsonSchema(schema) {
  const properties = {}
  const required = []

  for (const field of schema.fields) {
    properties[field.name] = { title: field.label, ...fieldToProperty(field) }
    if (field.validation?.required) required.push(field.name)
  }

  const document = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: schema.name,
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  }

  return JSON.stringify(document, null, 2) + '\n'
}
