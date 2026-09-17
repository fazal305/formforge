import { createField } from './createSchema.js'
import { toSafeIdentifier, ensureUniqueIdentifier } from './identifier.js'
import { setPath } from './path.js'

function reorder(fields) {
  return fields.map((field, index) => ({ ...field, order: index }))
}

function otherFieldNames(fields, excludeFieldId) {
  return fields.filter((f) => f.id !== excludeFieldId).map((f) => f.name)
}

/**
 * Every action is a pure (state, field-array) transition — this reducer is
 * also the undo/redo boundary: the builder pushes each resulting schema
 * onto a history stack rather than this reducer knowing about history.
 */
export function schemaReducer(schema, action) {
  switch (action.type) {
    case 'SET_SCHEMA':
      return action.schema

    case 'UPDATE_META':
      return { ...schema, ...action.patch }

    case 'UPDATE_SETTINGS':
      return { ...schema, settings: { ...schema.settings, ...action.patch } }

    case 'ADD_FIELD': {
      const existingNames = schema.fields.map((f) => f.name)
      const field = createField(action.fieldType, {
        existingNames,
        order: schema.fields.length,
      })
      const insertAt = action.atIndex ?? schema.fields.length
      const fields = [...schema.fields]
      fields.splice(insertAt, 0, field)
      return { ...schema, fields: reorder(fields) }
    }

    case 'UPDATE_FIELD_PROPERTY': {
      const fields = schema.fields.map((field) =>
        field.id === action.fieldId ? setPath(field, action.path, action.value) : field,
      )
      return { ...schema, fields }
    }

    case 'RENAME_FIELD': {
      const safe = toSafeIdentifier(action.name, 'field')
      const fields = schema.fields.map((field) => {
        if (field.id !== action.fieldId) return field
        const unique = ensureUniqueIdentifier(safe, otherFieldNames(schema.fields, field.id))
        return { ...field, name: unique }
      })
      return { ...schema, fields }
    }

    case 'DELETE_FIELD': {
      const fields = schema.fields.filter((field) => field.id !== action.fieldId)
      return { ...schema, fields: reorder(fields) }
    }

    case 'DUPLICATE_FIELD': {
      const index = schema.fields.findIndex((field) => field.id === action.fieldId)
      if (index === -1) return schema

      const source = schema.fields[index]
      const existingNames = schema.fields.map((f) => f.name)
      const duplicate = {
        ...source,
        id: createField(source.type, { existingNames }).id,
        name: ensureUniqueIdentifier(`${source.name}_copy`, existingNames),
      }
      const fields = [...schema.fields]
      fields.splice(index + 1, 0, duplicate)
      return { ...schema, fields: reorder(fields) }
    }

    case 'MOVE_FIELD': {
      const fromIndex = schema.fields.findIndex((field) => field.id === action.fieldId)
      if (fromIndex === -1) return schema

      const fields = [...schema.fields]
      const [moved] = fields.splice(fromIndex, 1)
      const toIndex = Math.max(0, Math.min(action.toIndex, fields.length))
      fields.splice(toIndex, 0, moved)
      return { ...schema, fields: reorder(fields) }
    }

    default:
      return schema
  }
}
