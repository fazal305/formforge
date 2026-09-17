/**
 * Encodes a JS value as a PHP literal, for embedding schema data into
 * generated PHP source. This is our equivalent of PHP's own var_export() —
 * we can't call var_export from JS, so we implement the same guarantee
 * ourselves: every string is single-quote-escaped correctly (backslash
 * first, then quote), never naively wrapped in quotes (section 59).
 */
export function encodePhpString(value) {
  const escaped = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `'${escaped}'`
}

export function encodePhpValue(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return encodePhpString(value)

  if (Array.isArray(value)) {
    return '[' + value.map(encodePhpValue).join(', ') + ']'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).map(
      ([key, val]) => `${encodePhpString(key)} => ${encodePhpValue(val)}`,
    )
    return '[' + entries.join(', ') + ']'
  }

  return 'null'
}
