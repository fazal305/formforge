/**
 * The one place user-authored schema text (labels, placeholders, help text,
 * option text) gets HTML-entity-escaped before being interpolated into a
 * generated document. Every generator that writes into an .html file must
 * route text through this — generated code is a compiler-output problem
 * (section 29), not a template-string convenience.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
