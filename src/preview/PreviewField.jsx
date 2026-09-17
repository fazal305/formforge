import './PreviewField.css'

const NATIVE_INPUT_TYPES = new Set(['text', 'email', 'password', 'number', 'phone', 'url', 'date', 'time'])
const TYPE_ATTRIBUTE = { phone: 'tel' }

function FieldShell({ field, error, children }) {
  const helpId = field.helpText ? `${field.id}-help` : undefined
  const errorId = error ? `${field.id}-error` : undefined

  return (
    <div className="ff-preview-field" data-width={field.layout?.width ?? 'full'}>
      <label className="ff-preview-field__label" htmlFor={field.id}>
        {field.label}
        {field.validation?.required ? <span className="ff-preview-field__required">*</span> : null}
      </label>
      {children({ helpId, errorId })}
      {field.helpText ? (
        <p className="ff-preview-field__help" id={helpId}>
          {field.helpText}
        </p>
      ) : null}
      {error ? (
        <p className="ff-preview-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Renders one field's actual interactive input from the schema — the same
 * data the generators read, so what a tester sees here is what the
 * exported form will contain (section 15: no separate hardcoded preview).
 */
export function PreviewField({ field, value, error, disabled, onChange, onBlur }) {
  if (field.type === 'hidden') return null

  if (NATIVE_INPUT_TYPES.has(field.type)) {
    return (
      <FieldShell field={field} error={error}>
        {({ helpId, errorId }) => (
          <input
            id={field.id}
            name={field.name}
            type={TYPE_ATTRIBUTE[field.type] ?? field.type}
            className="ff-preview-field__input"
            placeholder={field.placeholder}
            value={value ?? ''}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        )}
      </FieldShell>
    )
  }

  if (field.type === 'textarea') {
    return (
      <FieldShell field={field} error={error}>
        {({ helpId, errorId }) => (
          <textarea
            id={field.id}
            name={field.name}
            className="ff-preview-field__input"
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={value ?? ''}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        )}
      </FieldShell>
    )
  }

  if (field.type === 'select') {
    return (
      <FieldShell field={field} error={error}>
        {({ helpId, errorId }) => (
          <select
            id={field.id}
            name={field.name}
            className="ff-preview-field__input"
            value={value ?? ''}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          >
            <option value="" disabled>
              Select…
            </option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </FieldShell>
    )
  }

  if (field.type === 'radio') {
    return (
      <FieldShell field={field} error={error}>
        {({ helpId, errorId }) => (
          <div
            className="ff-preview-field__radio-group"
            role="radiogroup"
            aria-labelledby={undefined}
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
          >
            {field.options.map((option) => (
              <label className="ff-preview-field__radio" key={option.value}>
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={disabled}
                  onChange={() => onChange(option.value)}
                  onBlur={onBlur}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      </FieldShell>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className="ff-preview-field" data-width={field.layout?.width ?? 'full'}>
        <label className="ff-preview-field__checkbox">
          <input
            id={field.id}
            type="checkbox"
            name={field.name}
            checked={value === true}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
          />
          <span>
            {field.label}
            {field.validation?.required ? <span className="ff-preview-field__required">*</span> : null}
          </span>
        </label>
        {field.helpText ? <p className="ff-preview-field__help">{field.helpText}</p> : null}
        {error ? (
          <p className="ff-preview-field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  if (field.type === 'file') {
    return (
      <FieldShell field={field} error={error}>
        {({ helpId, errorId }) => (
          <input
            id={field.id}
            name={field.name}
            type="file"
            className="ff-preview-field__input"
            accept={field.fileConfig?.accept}
            multiple={field.fileConfig?.multiple}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
            onChange={(e) =>
              onChange(field.fileConfig?.multiple ? Array.from(e.target.files) : e.target.files[0] ?? null)
            }
            onBlur={onBlur}
          />
        )}
      </FieldShell>
    )
  }

  return null
}
