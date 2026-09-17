import { useState } from 'react'
import { IconButton } from '../../components/ui/Button.jsx'
import { PlusIcon, CloseIcon } from '../../components/ui/icons.jsx'
import { toSafeIdentifier, ensureUniqueIdentifier } from '../../schema/identifier.js'
import './FieldControls.css'

function ControlShell({ label, hint, children, row = false }) {
  return (
    <label className={`ff-control ${row ? 'ff-control--row' : ''}`}>
      {label ? <span className="ff-control__label">{label}</span> : null}
      {children}
      {hint ? <span className="ff-control__hint">{hint}</span> : null}
    </label>
  )
}

export function Switch({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      className="ff-switch"
      data-checked={checked}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
    >
      <span className="ff-switch__thumb" />
    </button>
  )
}

export function TextControl({ label, value, onChange, placeholder }) {
  return (
    <ControlShell label={label}>
      <input
        className="ff-control__input"
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </ControlShell>
  )
}

export function NumberControl({ label, value, onChange }) {
  return (
    <ControlShell label={label}>
      <input
        className="ff-control__input"
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    </ControlShell>
  )
}

export function ToggleControl({ label, value, onChange }) {
  return (
    <ControlShell label={label} row>
      <Switch checked={value === true} onChange={onChange} ariaLabel={label} />
    </ControlShell>
  )
}

/** The `name` property is special: it's sanitized to a safe identifier on blur, not live. */
export function NameControl({ label, value, otherNames, onCommit }) {
  const [draft, setDraft] = useState(value)

  return (
    <ControlShell label={label} hint="Used as the field's HTML/PHP/SQL identifier.">
      <input
        className="ff-control__input"
        style={{ fontFamily: 'var(--font-mono)' }}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const safe = ensureUniqueIdentifier(toSafeIdentifier(draft, 'field'), otherNames)
          setDraft(safe)
          if (safe !== value) onCommit(draft)
        }}
      />
    </ControlShell>
  )
}

export function OptionsListControl({ label, value, onChange }) {
  const options = value ?? []

  function updateOption(index, patch) {
    onChange(options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)))
  }

  function addOption() {
    const n = options.length + 1
    const existingValues = options.map((o) => o.value)
    const optValue = ensureUniqueIdentifier(toSafeIdentifier(`option_${n}`), existingValues)
    onChange([...options, { value: optValue, label: `Option ${n}` }])
  }

  function removeOption(index) {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div className="ff-control">
      <span className="ff-control__label">{label}</span>
      <div className="ff-options-list">
        {options.map((option, index) => (
          <div className="ff-options-list__row" key={index}>
            <input
              className="ff-control__input"
              type="text"
              value={option.label}
              onChange={(e) => {
                const existingValues = options.filter((_, i) => i !== index).map((o) => o.value)
                updateOption(index, {
                  label: e.target.value,
                  value: ensureUniqueIdentifier(
                    toSafeIdentifier(e.target.value, `option_${index + 1}`),
                    existingValues,
                  ),
                })
              }}
            />
            <IconButton label="Remove option" onClick={() => removeOption(index)}>
              <CloseIcon size={14} />
            </IconButton>
          </div>
        ))}
      </div>
      <button type="button" className="ff-button ff-button--ghost ff-button--sm" onClick={addOption}>
        <PlusIcon size={14} /> Add option
      </button>
    </div>
  )
}

export function FileConfigControl({ label, value, onChange }) {
  const config = value ?? { accept: '', maxSizeBytes: 5 * 1024 * 1024, multiple: false }

  return (
    <div className="ff-control">
      <span className="ff-control__label">{label}</span>
      <div className="ff-file-config">
        <ControlShell label="Accepted extensions" hint="Comma-separated, e.g. .pdf,.jpg">
          <input
            className="ff-control__input"
            type="text"
            value={config.accept}
            onChange={(e) => onChange({ ...config, accept: e.target.value })}
          />
        </ControlShell>
        <ControlShell label="Max file size (MB)">
          <input
            className="ff-control__input"
            type="number"
            value={Math.round((config.maxSizeBytes ?? 0) / (1024 * 1024))}
            onChange={(e) =>
              onChange({ ...config, maxSizeBytes: Number(e.target.value) * 1024 * 1024 })
            }
          />
        </ControlShell>
        <ControlShell label="Allow multiple files" row>
          <Switch
            checked={config.multiple === true}
            onChange={(next) => onChange({ ...config, multiple: next })}
            ariaLabel="Allow multiple files"
          />
        </ControlShell>
      </div>
    </div>
  )
}
