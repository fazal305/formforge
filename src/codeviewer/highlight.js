import Prism from 'prismjs'
import 'prismjs/components/prism-markup.js'
import 'prismjs/components/prism-css.js'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-sql.js'
import 'prismjs/components/prism-markup-templating.js'
import 'prismjs/components/prism-php.js'

const LANGUAGE_BY_EXTENSION = {
  html: 'markup',
  css: 'css',
  js: 'javascript',
  json: 'json',
  php: 'php',
  sql: 'sql',
}

export function languageForPath(path) {
  const extension = path.split('.').pop()
  return LANGUAGE_BY_EXTENSION[extension] ?? 'markup'
}

/** Returns highlighted HTML for a file's content — read-only display only, never executed. */
export function highlightCode(code, path) {
  const language = languageForPath(path)
  const grammar = Prism.languages[language]
  if (!grammar) return code
  return Prism.highlight(code, grammar, language)
}
