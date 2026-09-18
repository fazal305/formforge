import { describe, it, expect } from 'vitest'
import { createField } from '../src/schema/createSchema.js'
import { validateFieldValue, validateForm } from '../src/validation/validateField.js'

function field(type, overrides = {}) {
  const f = createField(type, { existingNames: [] })
  if (overrides.validation) f.validation = { ...f.validation, ...overrides.validation }
  return { ...f, ...overrides, validation: f.validation }
}

describe('validateFieldValue — required', () => {
  it('rejects empty/whitespace-only text, accepts a real value', () => {
    const f = field('text', { validation: { required: true } })
    expect(validateFieldValue(f, '')).toBe('This field is required.')
    expect(validateFieldValue(f, '   ')).toBe('This field is required.')
    expect(validateFieldValue(f, 'hi')).toBeNull()
  })

  it('skips all other checks when a non-required field is empty', () => {
    const f = field('text', { validation: { minLength: 5 } })
    expect(validateFieldValue(f, '')).toBeNull()
  })

  it('treats an unchecked checkbox as empty, a checked one as filled', () => {
    const f = field('checkbox', { validation: { required: true } })
    expect(validateFieldValue(f, false)).toBe('This field is required.')
    expect(validateFieldValue(f, true)).toBeNull()
  })
})

describe('validateFieldValue — format', () => {
  it('validates email format', () => {
    const f = field('email')
    expect(validateFieldValue(f, 'not-an-email')).toBe('Enter a valid email address.')
    expect(validateFieldValue(f, 'a@b.com')).toBeNull()
  })

  it('validates URL format', () => {
    const f = field('url')
    expect(validateFieldValue(f, 'not a url')).toMatch(/valid URL/)
    expect(validateFieldValue(f, 'https://example.com')).toBeNull()
  })
})

describe('validateFieldValue — length and range', () => {
  it('enforces min/max length', () => {
    const f = field('textarea', { validation: { minLength: 10, maxLength: 20 } })
    expect(validateFieldValue(f, 'short')).toMatch(/at least 10/)
    expect(validateFieldValue(f, 'this is way too long for the field')).toMatch(/no more than 20/)
    expect(validateFieldValue(f, 'just right!!')).toBeNull()
  })

  it('enforces numeric min/max', () => {
    const f = field('number', { validation: { min: 18, max: 65 } })
    expect(validateFieldValue(f, '10')).toMatch(/at least 18/)
    expect(validateFieldValue(f, '99')).toMatch(/no more than 65/)
    expect(validateFieldValue(f, '30')).toBeNull()
  })

  it('enforces date min/max distinctly from numeric range', () => {
    const f = field('date', { validation: { min: '2026-01-01', max: '2026-12-31' } })
    expect(validateFieldValue(f, '2025-06-01')).toMatch(/on or after/)
    expect(validateFieldValue(f, '2026-06-01')).toBeNull()
  })
})

describe('validateFieldValue — pattern', () => {
  it('matches a regex pattern and fails safe on a malformed one', () => {
    const zip = field('text', { validation: { pattern: '^[0-9]{5}$' } })
    expect(validateFieldValue(zip, 'abcde')).toMatch(/does not match/)
    expect(validateFieldValue(zip, '12345')).toBeNull()

    const broken = field('text', { validation: { pattern: '(' } })
    expect(validateFieldValue(broken, 'anything')).toBeNull()
  })
})

describe('validateFieldValue — file', () => {
  const upload = field('file', {
    validation: { required: true },
    fileConfig: { accept: '.pdf,.jpg', maxSizeBytes: 1024, multiple: false },
  })

  it('requires at least one file when required', () => {
    expect(validateFieldValue(upload, null)).toBe('This field is required.')
  })

  it('rejects a disallowed extension', () => {
    const file = new File(['x'], 'resume.exe', { type: 'application/octet-stream' })
    expect(validateFieldValue(upload, file)).toMatch(/file types are allowed/)
  })

  it('rejects a file over the size limit', () => {
    const file = new File(['x'.repeat(2048)], 'resume.pdf', { type: 'application/pdf' })
    expect(validateFieldValue(upload, file)).toMatch(/smaller than/)
  })

  it('accepts a valid single file, rejects multiple when not allowed', () => {
    const ok = new File(['x'], 'resume.pdf', { type: 'application/pdf' })
    expect(validateFieldValue(upload, ok)).toBeNull()

    const two = [ok, new File(['x'], 'resume2.pdf', { type: 'application/pdf' })]
    expect(validateFieldValue(upload, two)).toMatch(/Only one file/)
  })
})

describe('validateForm', () => {
  it('aggregates per-field errors keyed by field id', () => {
    const name = field('text', { validation: { required: true } })
    const email = field('email')
    const schema = { fields: [name, email] }
    const errors = validateForm(schema, { [name.name]: '', [email.name]: 'bad' })
    expect(Object.keys(errors)).toHaveLength(2)
    expect(errors[name.id]).toBe('This field is required.')
    expect(errors[email.id]).toBe('Enter a valid email address.')
  })
})
