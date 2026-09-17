import { validateSchema } from './validateSchema.js'

const DRAFT_KEY = 'formforge:draft'
const SAVED_FORMS_KEY = 'formforge:savedForms'

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Unavailable storage (private mode, blocked site data) or corrupt JSON — treat as absent.
    return null
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** The in-progress form the builder is currently editing — autosaved, not an explicit "save". */
export function saveDraft(schema) {
  return writeJson(DRAFT_KEY, schema)
}

export function loadDraft() {
  const candidate = readJson(DRAFT_KEY)
  if (!candidate) return null

  const { valid, errors } = validateSchema(candidate)
  if (!valid) {
    console.warn('Discarding corrupt FormForge draft from localStorage:', errors)
    return null
  }
  return candidate
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing to clean up if storage was already unavailable.
  }
}

/** Explicitly "Save"d forms — a named list distinct from the autosaved draft. */
export function listSavedForms() {
  const forms = readJson(SAVED_FORMS_KEY)
  if (!Array.isArray(forms)) return []
  return forms
    .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function getSavedForm(id) {
  const forms = readJson(SAVED_FORMS_KEY)
  if (!Array.isArray(forms)) return null

  const entry = forms.find((form) => form.id === id)
  if (!entry) return null

  const { valid, errors } = validateSchema(entry.schema)
  if (!valid) {
    console.warn(`Discarding corrupt saved form "${id}":`, errors)
    return null
  }
  return entry.schema
}

export function saveForm(schema) {
  const forms = readJson(SAVED_FORMS_KEY)
  const list = Array.isArray(forms) ? forms : []
  const updatedAt = new Date().toISOString()

  const index = list.findIndex((form) => form.id === schema.id)
  const entry = { id: schema.id, name: schema.name, updatedAt, schema }

  if (index === -1) {
    list.push(entry)
  } else {
    list[index] = entry
  }

  return writeJson(SAVED_FORMS_KEY, list)
}

export function deleteSavedForm(id) {
  const forms = readJson(SAVED_FORMS_KEY)
  if (!Array.isArray(forms)) return true
  return writeJson(
    SAVED_FORMS_KEY,
    forms.filter((form) => form.id !== id),
  )
}
