import { escapeHtml } from './escapeHtml.js'

const NATIVE_TYPE_ATTRIBUTE = { phone: 'tel' }
const NATIVE_TEXT_TYPES = new Set(['text', 'email', 'password', 'number', 'phone', 'url', 'date', 'time'])

function requiredMarker(field) {
  return field.validation?.required ? ' <span class="required" aria-hidden="true">*</span>' : ''
}

function fieldMeta(field) {
  const helpId = field.helpText ? `${field.id}-help` : ''
  const errorId = `${field.id}-error`
  const describedBy = [helpId, errorId].filter(Boolean).join(' ')
  return { helpId, errorId, describedBy }
}

function renderHelpAndError(field) {
  const { helpId, errorId } = fieldMeta(field)
  const help = field.helpText
    ? `\n    <p class="help" id="${helpId}">${escapeHtml(field.helpText)}</p>`
    : ''
  return `${help}\n    <p class="field-error" id="${errorId}" role="alert" hidden></p>`
}

function renderNativeInput(field) {
  const { describedBy } = fieldMeta(field)
  const type = NATIVE_TYPE_ATTRIBUTE[field.type] ?? field.type
  return `<input
      id="${field.id}"
      name="${escapeHtml(field.name)}"
      type="${type}"
      placeholder="${escapeHtml(field.placeholder)}"
      value="${escapeHtml(field.defaultValue)}"
      aria-describedby="${describedBy}"
    />`
}

function renderTextarea(field) {
  const { describedBy } = fieldMeta(field)
  return `<textarea
      id="${field.id}"
      name="${escapeHtml(field.name)}"
      rows="${field.rows ?? 4}"
      placeholder="${escapeHtml(field.placeholder)}"
      aria-describedby="${describedBy}"
    >${escapeHtml(field.defaultValue)}</textarea>`
}

function renderSelect(field) {
  const { describedBy } = fieldMeta(field)
  const options = field.options
    .map((opt) => `      <option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`)
    .join('\n')
  return `<select id="${field.id}" name="${escapeHtml(field.name)}" aria-describedby="${describedBy}">
      <option value="" disabled selected>Select…</option>
${options}
    </select>`
}

function renderRadioGroup(field) {
  const { describedBy } = fieldMeta(field)
  const options = field.options
    .map(
      (opt) => `      <label class="radio-option">
        <input type="radio" name="${escapeHtml(field.name)}" value="${escapeHtml(opt.value)}" />
        ${escapeHtml(opt.label)}
      </label>`,
    )
    .join('\n')
  return `<fieldset aria-describedby="${describedBy}">
      <legend>${escapeHtml(field.label)}${requiredMarker(field)}</legend>
${options}
    </fieldset>`
}

function renderCheckbox(field) {
  const checked = field.defaultValue === true ? ' checked' : ''
  return `<label class="checkbox-field">
      <input type="checkbox" id="${field.id}" name="${escapeHtml(field.name)}"${checked} />
      ${escapeHtml(field.label)}${requiredMarker(field)}
    </label>`
}

function renderFile(field) {
  const { describedBy } = fieldMeta(field)
  const accept = field.fileConfig?.accept ? ` accept="${escapeHtml(field.fileConfig.accept)}"` : ''
  const multiple = field.fileConfig?.multiple ? ' multiple' : ''
  return `<input
      id="${field.id}"
      name="${escapeHtml(field.name)}"
      type="file"${accept}${multiple}
      aria-describedby="${describedBy}"
    />`
}

/** Renders one field's semantic markup. Every interpolated value passes through escapeHtml. */
function renderField(field) {
  if (field.type === 'hidden') {
    return `  <input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(field.defaultValue)}" />`
  }

  if (field.type === 'checkbox') {
    return `  <div class="field field--checkbox" data-field="${escapeHtml(field.name)}">
    ${renderCheckbox(field)}${renderHelpAndError(field)}
  </div>`
  }

  if (field.type === 'radio') {
    return `  <div class="field" data-field="${escapeHtml(field.name)}">
    ${renderRadioGroup(field)}${renderHelpAndError(field)}
  </div>`
  }

  let control
  if (field.type === 'textarea') control = renderTextarea(field)
  else if (field.type === 'select') control = renderSelect(field)
  else if (field.type === 'file') control = renderFile(field)
  else if (NATIVE_TEXT_TYPES.has(field.type)) control = renderNativeInput(field)
  else return ''

  return `  <div class="field" data-field="${escapeHtml(field.name)}">
    <label for="${field.id}">${escapeHtml(field.label)}${requiredMarker(field)}</label>
    ${control}${renderHelpAndError(field)}
  </div>`
}

/**
 * Generates a standalone index.html. `novalidate` is set because script.js
 * runs its own validation (section 43) — without it, the browser's native
 * constraint validation could block submission before our JS ever runs,
 * or show its own error UI alongside ours.
 */
export function generateHtml(schema) {
  const fieldsHtml = schema.fields.map(renderField).filter(Boolean).join('\n')
  const description = schema.description
    ? `\n    <p class="form-description">${escapeHtml(schema.description)}</p>`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(schema.name)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="form-page">
    <form
      id="${schema.id}"
      class="ff-form"
      data-layout="${schema.settings.layout}"
      method="${schema.settings.method}"
      action="${escapeHtml(schema.settings.action)}"
      novalidate
    >
      <h1>${escapeHtml(schema.name)}</h1>${description}

${fieldsHtml}

      <p class="form-status" id="form-status" role="status" aria-live="polite" hidden></p>

      <button type="submit" class="submit-button">${escapeHtml(schema.settings.submitLabel)}</button>
    </form>
  </main>
  <script src="script.js" defer></script>
</body>
</html>
`
}
