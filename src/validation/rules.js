/**
 * Every rule is a pure function over structured input — never a string of
 * user-supplied JavaScript. This is what keeps the validation engine safe
 * to run against untrusted schema data (an imported form, later an
 * AI-generated one) and, eventually, portable to a PHP interpreter reading
 * the same declarative `validation` object (section 17).
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function checkEmailFormat(value) {
  return EMAIL_PATTERN.test(value) ? null : 'Enter a valid email address.'
}

export function checkUrlFormat(value) {
  try {
    new URL(value)
    return null
  } catch {
    return 'Enter a valid URL, including https://.'
  }
}

export function checkMinLength(value, min) {
  return String(value).length < min ? `Must be at least ${min} characters.` : null
}

export function checkMaxLength(value, max) {
  return String(value).length > max ? `Must be no more than ${max} characters.` : null
}

export function checkNumericMin(value, min) {
  const num = Number(value)
  if (Number.isNaN(num)) return 'Enter a number.'
  return num < min ? `Must be at least ${min}.` : null
}

export function checkNumericMax(value, max) {
  const num = Number(value)
  if (Number.isNaN(num)) return 'Enter a number.'
  return num > max ? `Must be no more than ${max}.` : null
}

export function checkDateMin(value, min) {
  const date = new Date(value)
  const minDate = new Date(min)
  return date < minDate ? `Date must be on or after ${min}.` : null
}

export function checkDateMax(value, max) {
  const date = new Date(value)
  const maxDate = new Date(max)
  return date > maxDate ? `Date must be on or before ${max}.` : null
}

/** `pattern` is a plain regex string from the schema — matched, never evaluated as code. */
export function checkPattern(value, pattern) {
  try {
    return new RegExp(pattern).test(String(value)) ? null : 'Value does not match the required format.'
  } catch {
    // A malformed user-authored pattern shouldn't crash validation for everyone submitting the form.
    return null
  }
}

function toFileArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function fileExtension(filename) {
  const match = /\.[^.]+$/.exec(filename)
  return match ? match[0].toLowerCase() : ''
}

export function checkFileConfig(value, fileConfig) {
  const files = toFileArray(value)
  if (files.length === 0) return null

  if (!fileConfig.multiple && files.length > 1) {
    return 'Only one file can be uploaded.'
  }

  const allowedExtensions = (fileConfig.accept ?? '')
    .split(',')
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean)

  for (const file of files) {
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension(file.name))) {
      return `Only these file types are allowed: ${fileConfig.accept}`
    }
    if (fileConfig.maxSizeBytes && file.size > fileConfig.maxSizeBytes) {
      const maxMb = Math.round(fileConfig.maxSizeBytes / (1024 * 1024))
      return `File must be smaller than ${maxMb} MB.`
    }
  }

  return null
}
