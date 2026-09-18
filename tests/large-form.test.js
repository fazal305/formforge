import { describe, it, expect } from 'vitest'
import { createEmptyForm } from '../src/schema/createSchema.js'
import { schemaReducer } from '../src/schema/schemaReducer.js'
import { validateSchema } from '../src/schema/validateSchema.js'
import { generateProjectFiles } from '../src/generators/generateProject.js'
import { listFieldDefinitions } from '../src/schema/fieldRegistry.js'

const FIELD_TYPES = listFieldDefinitions().map((d) => d.type)

/** Cycles through every registered type to build an N-field form — section 92's 20-30 field stress test. */
function buildLargeSchema(fieldCount) {
  let schema = createEmptyForm('Large Form')
  for (let i = 0; i < fieldCount; i++) {
    schema = schemaReducer(schema, { type: 'ADD_FIELD', fieldType: FIELD_TYPES[i % FIELD_TYPES.length] })
  }
  return schema
}

describe('large form (25 fields, cycling every field type)', () => {
  const schema = buildLargeSchema(25)

  it('builds without name collisions and passes schema validation', () => {
    expect(schema.fields).toHaveLength(25)
    expect(new Set(schema.fields.map((f) => f.name)).size).toBe(25)
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] })
  })

  it('reordering and deleting stay internally consistent at this scale', () => {
    let s = schema
    s = schemaReducer(s, { type: 'MOVE_FIELD', fieldId: s.fields[24].id, toIndex: 0 })
    expect(s.fields[0].id).toBe(schema.fields[24].id)
    expect(s.fields.every((f, i) => f.order === i)).toBe(true)

    s = schemaReducer(s, { type: 'DELETE_FIELD', fieldId: s.fields[10].id })
    expect(s.fields).toHaveLength(24)
    expect(s.fields.every((f, i) => f.order === i)).toBe(true)
  })

  it('generation completes and produces a file per generator, well within a UI-blocking threshold', () => {
    const start = performance.now()
    const files = generateProjectFiles(schema)
    const elapsed = performance.now() - start

    expect(Object.keys(files).length).toBeGreaterThan(5)
    expect(elapsed).toBeLessThan(500) // generous — this is synchronous JS string building, not I/O
  })

  it('every field still gets a JSON Schema property at this scale', () => {
    const files = generateProjectFiles(schema)
    const doc = JSON.parse(files['schema/form.schema.json'])
    expect(Object.keys(doc.properties)).toHaveLength(25)
  })
})
