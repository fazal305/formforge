/**
 * FormForge's own JSON export/import — a saved form design a user can
 * reopen later or hand to another FormForge user. Distinct from the ZIP
 * export (Phase 11), which produces the generated *application*, not the
 * editable design.
 */
export function downloadSchemaJson(schema) {
  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${schema.id}.formforge.json`
  link.click()
  URL.revokeObjectURL(url)
}

/** Reads a File into a parsed JS value. Throws with a clear message on invalid JSON — never trust the content yet. */
export function readSchemaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch {
        reject(new Error('That file is not valid JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsText(file)
  })
}
