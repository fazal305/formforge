import { getFieldDefinition } from '../schema/fieldRegistry.js'
import { getPath } from '../schema/path.js'
import { useBuilder } from './BuilderContext.jsx'
import { FormSettingsPanel } from './FormSettingsPanel.jsx'
import {
  TextControl,
  NumberControl,
  ToggleControl,
  NameControl,
  OptionsListControl,
  FileConfigControl,
} from './controls/FieldControls.jsx'
import './PropertiesInspector.css'

/**
 * Reads a field type's `propertySchema` from the registry and renders the
 * matching generic control for each entry. Adding a new field type never
 * requires touching this component — only its registry module.
 */
function PropertyControl({ field, entry, otherNames, dispatch }) {
  const value = getPath(field, entry.key)
  const setValue = (next) =>
    dispatch({ type: 'UPDATE_FIELD_PROPERTY', fieldId: field.id, path: entry.key, value: next })

  switch (entry.control) {
    case 'identifier':
      return (
        <NameControl
          label={entry.label}
          value={field.name}
          otherNames={otherNames}
          onCommit={(name) => dispatch({ type: 'RENAME_FIELD', fieldId: field.id, name })}
        />
      )
    case 'toggle':
      return <ToggleControl label={entry.label} value={value} onChange={setValue} />
    case 'number':
      return <NumberControl label={entry.label} value={value} onChange={setValue} />
    case 'optionsList':
      return <OptionsListControl label={entry.label} value={value} onChange={setValue} />
    case 'fileConfig':
      return <FileConfigControl label={entry.label} value={value} onChange={setValue} />
    case 'text':
    default:
      return <TextControl label={entry.label} value={value} onChange={setValue} />
  }
}

export function PropertiesInspector() {
  const { schema, selectedFieldId, dispatch } = useBuilder()
  const field = schema.fields.find((f) => f.id === selectedFieldId)

  if (!field) {
    return (
      <div className="ff-properties-inspector">
        <FormSettingsPanel />
      </div>
    )
  }

  const definition = getFieldDefinition(field.type)
  const otherNames = schema.fields.filter((f) => f.id !== field.id).map((f) => f.name)

  return (
    <div className="ff-properties-inspector">
      <div className="ff-properties-inspector__body">
        {definition?.propertySchema.map((entry) => (
          <PropertyControl
            // Keyed on the field too, not just the property: switching the
            // selected field must remount controls with their own local draft
            // state (NameControl) rather than reusing the previous field's.
            key={`${field.id}:${entry.key}`}
            field={field}
            entry={entry}
            otherNames={otherNames}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
