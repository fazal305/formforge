/**
 * Field names become an HTML `name`, a JS/JSON key, a PHP array key, and
 * (after the SQL generator's own reserved-word/backtick handling) a SQL
 * column — so the identifier rules here are the intersection of all four,
 * checked once, at the point of entry (builder edit + schema import), not
 * re-derived differently by each generator.
 */

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]{0,62}$/
const MAX_LENGTH = 63 // MySQL column identifier limit is the tightest constraint

export function isValidIdentifier(name) {
  return typeof name === 'string' && IDENTIFIER_PATTERN.test(name)
}

/** Best-effort slugify of a human label ("Full Name") into a safe identifier ("full_name"). */
export function toSafeIdentifier(label, fallback = 'field') {
  const slug = String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_LENGTH)

  if (isValidIdentifier(slug)) return slug
  if (slug && /^[0-9]/.test(slug)) return toSafeIdentifier(`f_${slug}`, fallback)
  return fallback
}

/** Appends _2, _3, ... until the name no longer collides with existingNames. */
export function ensureUniqueIdentifier(candidate, existingNames) {
  const taken = new Set(existingNames)
  if (!taken.has(candidate)) return candidate

  let suffix = 2
  let next = `${candidate}_${suffix}`.slice(0, MAX_LENGTH)
  while (taken.has(next)) {
    suffix += 1
    next = `${candidate}_${suffix}`.slice(0, MAX_LENGTH)
  }
  return next
}
