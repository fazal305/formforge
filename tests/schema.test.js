import { describe, it, expect } from 'vitest'
import { createEmptyForm } from '../src/schema/createSchema.js'
import { schemaReducer } from '../src/schema/schemaReducer.js'
import { validateSchema } from '../src/schema/validateSchema.js'
import { listFieldDefinitions } from '../src/schema/fieldRegistry.js'
import { toSafeIdentifier, ensureUniqueIdentifier, isValidIdentifier } from '../src/schema/identifier.js'

describe('field registry', () => {
  it('registers all 14 core field types', () => {
    expect(listFieldDefinitions()).toHaveLength(14)
  })
})

describe('identifier utilities', () => {
  it('slugifies a human label into a safe identifier', () => {
    expect(toSafeIdentifier('Full Name!!')).toBe('full_name')
    expect(toSafeIdentifier('  Email Address  ')).toBe('email_address')
  })

  it('falls back when the label produces nothing usable', () => {
    expect(toSafeIdentifier('!!!', 'field')).toBe('field')
  })

  it('prefixes a leading digit rather than producing an invalid identifier', () => {
    expect(isValidIdentifier(toSafeIdentifier('123 Go'))).toBe(true)
  })

  it('appends a numeric suffix to avoid collisions', () => {
    expect(ensureUniqueIdentifier('email', ['email'])).toBe('email_2')
    expect(ensureUniqueIdentifier('email', ['email', 'email_2'])).toBe('email_3')
  })
})

describe('schemaReducer', () => {
  it('adds fields with auto-uniquified names', () => {
    let schema = createEmptyForm('Contact Form')
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'text' })
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'text' })
    expect(schema.fields.map((f) => f.name)).toEqual(['text', 'text_2'])
  })

  it('renames a field, sanitizing the label into a safe identifier', () => {
    let schema = createEmptyForm()
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'text' })
    schema = schemaReducer(schema, {
      type: 'RENAME_FIELD',
      fieldId: schema.fields[0].id,
      name: 'Full Name!!',
    })
    expect(schema.fields[0].name).toBe('full_name')
  })

  it('sets a nested validation property via dot-path', () => {
    let schema = createEmptyForm()
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'email' })
    schema = schemaReducer(schema, {
      type: 'UPDATE_FIELD_PROPERTY',
      fieldId: schema.fields[0].id,
      path: 'validation.required',
      value: true,
    })
    expect(schema.fields[0].validation.required).toBe(true)
  })

  it('duplicates a field with a unique name, and reindexes order after delete/move', () => {
    let schema = createEmptyForm()
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'text' })
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'email' })
    schema = schemaReducer(schema, { type: 'DUPLICATE_FIELD', fieldId: schema.fields[0].id })
    expect(schema.fields.map((f) => f.name)).toEqual(['text', 'text_copy', 'email'])

    schema = schemaReducer(schema, {
      type: 'MOVE_FIELD',
      fieldId: schema.fields[2].id,
      toIndex: 0,
    })
    expect(schema.fields[0].type).toBe('email')
    expect(schema.fields.every((f, i) => f.order === i)).toBe(true)

    schema = schemaReducer(schema, { type: 'DELETE_FIELD', fieldId: schema.fields[0].id })
    expect(schema.fields).toHaveLength(2)
    expect(schema.fields.every((f, i) => f.order === i)).toBe(true)
  })

  it('returns the same reference for an unknown action (no-op)', () => {
    const schema = createEmptyForm()
    expect(schemaReducer(schema, { type: 'NOT_A_REAL_ACTION' })).toBe(schema)
  })
})

describe('validateSchema', () => {
  it('accepts a well-formed schema built entirely through the reducer', () => {
    let schema = createEmptyForm()
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: 'email' })
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] })
  })

  it('rejects an unknown field type with a specific message', () => {
    const schema = createEmptyForm()
    schema.fields = [{ id: 'f1', type: 'not_a_type', name: 'ok_name', label: 'X', options: [] }]
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('not a known field type'))).toBe(true)
  })

  it('rejects duplicate field names', () => {
    const schema = createEmptyForm()
    schema.fields = [
      { id: 'f1', type: 'text', name: 'dup', label: 'A', options: [] },
      { id: 'f2', type: 'text', name: 'dup', label: 'B', options: [] },
    ]
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('duplicated'))).toBe(true)
  })

  it('rejects a schema with a future/unknown version before checking anything else', () => {
    const schema = { ...createEmptyForm(), schemaVersion: 99 }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/Unsupported schema version/)
  })

  it('fails safe on non-object input', () => {
    expect(validateSchema(null).valid).toBe(false)
    expect(validateSchema('a string').valid).toBe(false)
    expect(validateSchema([1, 2, 3]).valid).toBe(false)
  })
})
