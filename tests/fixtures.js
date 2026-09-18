import { createEmptyForm, createField } from '../src/schema/createSchema.js'
import { toSafeIdentifier, ensureUniqueIdentifier } from '../src/schema/identifier.js'

/**
 * Appends a field built from the registry, merges overrides, keeps names
 * collision-free. If `overrides.label` is given, the name is re-derived
 * from it — matching what RENAME_FIELD would produce in the real UI —
 * rather than leaving the registry's default-type name (e.g. a field
 * labeled "Message" ending up named "textarea").
 */
export function addField(schema, type, overrides = {}) {
  const existingNames = schema.fields.map((f) => f.name)
  const field = createField(type, { existingNames })
  const merged = { ...field, ...overrides }
  if (overrides.validation) merged.validation = { ...field.validation, ...overrides.validation }
  if (overrides.label) {
    merged.name = ensureUniqueIdentifier(toSafeIdentifier(overrides.label, field.type), existingNames)
  }
  schema.fields.push(merged)
  return merged
}

/** The four representative forms from the original product brief (section 03/64) — used as generator fixtures. */
export function contactFormSchema() {
  const schema = createEmptyForm('Contact Form')
  addField(schema, 'text', { label: 'Name', validation: { required: true } })
  addField(schema, 'email', { label: 'Email', validation: { required: true } })
  addField(schema, 'textarea', { label: 'Message', validation: { required: true, minLength: 10 } })
  return schema
}

export function jobApplicationSchema() {
  const schema = createEmptyForm('Job Application')
  addField(schema, 'text', { label: 'Name', validation: { required: true } })
  addField(schema, 'email', { label: 'Email', validation: { required: true } })
  addField(schema, 'file', {
    label: 'Resume',
    validation: { required: true },
    fileConfig: { accept: '.pdf,.doc,.docx', maxSizeBytes: 5 * 1024 * 1024, multiple: false },
  })
  addField(schema, 'number', { label: 'Years of experience', validation: { min: 0, max: 50 } })
  addField(schema, 'textarea', { label: 'Cover letter' })
  return schema
}

export function registrationSchema() {
  const schema = createEmptyForm('Registration')
  addField(schema, 'text', { label: 'Name', validation: { required: true } })
  addField(schema, 'email', { label: 'Email', validation: { required: true } })
  addField(schema, 'password', { label: 'Password', validation: { required: true, minLength: 8 } })
  addField(schema, 'checkbox', { label: 'I agree to the terms', validation: { required: true } })
  return schema
}

export function customerIntakeSchema() {
  const schema = createEmptyForm('Customer Intake')
  schema.settings.storeSubmissions = true
  addField(schema, 'text', { label: 'Name', validation: { required: true } })
  addField(schema, 'phone', { label: 'Phone' })
  addField(schema, 'email', { label: 'Email', validation: { required: true } })
  addField(schema, 'select', {
    label: 'Category',
    options: [
      { value: 'billing', label: 'Billing' },
      { value: 'support', label: 'Support' },
    ],
  })
  addField(schema, 'file', {
    label: 'Attachment',
    fileConfig: { accept: '.pdf,.jpg,.png', maxSizeBytes: 5 * 1024 * 1024, multiple: false },
  })
  addField(schema, 'textarea', { label: 'Notes' })
  addField(schema, 'hidden', { label: 'Source', defaultValue: 'website' })
  return schema
}

export const ALL_FIXTURES = {
  'contact-form': contactFormSchema,
  'job-application': jobApplicationSchema,
  registration: registrationSchema,
  'customer-intake': customerIntakeSchema,
}
