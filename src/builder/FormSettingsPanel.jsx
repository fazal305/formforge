import { useBuilder } from './BuilderContext.jsx'
import { TextControl, ToggleControl } from './controls/FieldControls.jsx'

const CONTROL_CLASS = 'ff-control'

export function FormSettingsPanel() {
  const { schema, dispatch } = useBuilder()

  return (
    <div className="ff-properties-inspector__body">
      <TextControl
        label="Form name"
        value={schema.name}
        onChange={(value) => dispatch({ type: 'UPDATE_META', patch: { name: value } })}
      />
      <TextControl
        label="Submit button text"
        value={schema.settings.submitLabel}
        onChange={(value) => dispatch({ type: 'UPDATE_SETTINGS', patch: { submitLabel: value } })}
      />
      <TextControl
        label="Success message"
        value={schema.settings.successMessage}
        onChange={(value) =>
          dispatch({ type: 'UPDATE_SETTINGS', patch: { successMessage: value } })
        }
      />
      <TextControl
        label="Error message"
        value={schema.settings.errorMessage}
        onChange={(value) => dispatch({ type: 'UPDATE_SETTINGS', patch: { errorMessage: value } })}
      />
      <TextControl
        label="Submit action (endpoint)"
        value={schema.settings.action}
        onChange={(value) => dispatch({ type: 'UPDATE_SETTINGS', patch: { action: value } })}
      />
      <label className={CONTROL_CLASS}>
        <span className="ff-control__label">Layout</span>
        <select
          className="ff-control__input"
          value={schema.settings.layout}
          onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { layout: e.target.value } })}
        >
          <option value="single-column">Single column</option>
          <option value="two-column">Two column</option>
        </select>
      </label>
      <ToggleControl
        label="Store submissions in a database"
        value={schema.settings.storeSubmissions}
        onChange={(value) =>
          dispatch({ type: 'UPDATE_SETTINGS', patch: { storeSubmissions: value } })
        }
      />
    </div>
  )
}
