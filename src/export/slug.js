/**
 * A filesystem/zip-safe slug, distinct from schema/identifier.js: that
 * module produces code identifiers (snake_case, must be a valid PHP/SQL/JS
 * name); this one just needs to be a readable, portable folder/zip name.
 */
export function toKebabSlug(label, fallback = 'formforge-project') {
  const slug = String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}
