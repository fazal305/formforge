import { useState } from 'react'
import { validateForm } from '../validation/validateField.js'
import { PreviewField } from './PreviewField.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/Panel.jsx'
import './PreviewRenderer.css'

function initialValues(schema) {
  const values = {}
  for (const field of schema.fields) {
    values[field.name] = field.type === 'checkbox' ? field.defaultValue === true : field.defaultValue ?? ''
  }
  return values
}

/**
 * Renders and runs the form purely from the schema — the same field list,
 * labels, and validation rules the builder edits and the generators read.
 * This is a simulation of submission, not a real network call: the
 * generated project (Phase 8+) is an independent application, and this
 * preview never depends on it existing (section 62).
 */
export function PreviewRenderer({ schema }) {
  const [values, setValues] = useState(() => initialValues(schema))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [simulateFailure, setSimulateFailure] = useState(false)

  const visibleFields = schema.fields.filter((f) => f.type !== 'hidden')

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field.name]: value }))
  }

  function handleBlur(field) {
    const message = validateForm(schema, values)[field.id]
    setErrors((prev) => ({ ...prev, [field.id]: message }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validateForm(schema, values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')
    setTimeout(() => {
      setStatus(simulateFailure ? 'error' : 'success')
    }, 600)
  }

  function handleReset() {
    setValues(initialValues(schema))
    setErrors({})
    setStatus('idle')
  }

  if (visibleFields.length === 0) {
    return (
      <EmptyState
        title="Nothing to preview yet"
        description="Add at least one field on the canvas to see it here."
      />
    )
  }

  if (status === 'success') {
    return (
      <div className="ff-preview-result ff-preview-result--success">
        <p>{schema.settings.successMessage}</p>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Submit another response
        </Button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="ff-preview-result ff-preview-result--error">
        <p>{schema.settings.errorMessage}</p>
        <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <form
      className="ff-preview-form"
      data-layout={schema.settings.layout}
      noValidate
      onSubmit={handleSubmit}
    >
      {visibleFields.map((field) => (
        <PreviewField
          key={field.id}
          field={field}
          value={values[field.name]}
          error={errors[field.id]}
          disabled={status === 'submitting'}
          onChange={(value) => handleChange(field, value)}
          onBlur={() => handleBlur(field)}
        />
      ))}

      <div className="ff-preview-form__footer">
        <label className="ff-preview-form__simulate-failure">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
          />
          Simulate a failed submission
        </label>
        <Button type="submit" variant="primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : schema.settings.submitLabel}
        </Button>
      </div>
    </form>
  )
}
