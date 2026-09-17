import JSZip from 'jszip'
import { generateExportFiles } from './generateExportFiles.js'
import { toKebabSlug } from './slug.js'

/**
 * Assembles the selected files under a single root folder and returns a
 * Blob ready for download. No empty folders are ever created — JSZip only
 * writes paths we explicitly add, and generateExportFiles() never emits a
 * folder without files in it (section 26).
 */
export async function buildProjectZip(schema, options) {
  const files = generateExportFiles(schema, options)
  const root = toKebabSlug(schema.name)

  const zip = new JSZip()
  for (const [path, content] of Object.entries(files)) {
    zip.file(`${root}/${path}`, content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  return { blob, filename: `${root}.zip` }
}
