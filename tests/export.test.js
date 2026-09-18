import { describe, it, expect } from 'vitest'
import { generateExportFiles } from '../src/export/generateExportFiles.js'
import { toKebabSlug } from '../src/export/slug.js'
import { contactFormSchema } from './fixtures.js'

describe('generateExportFiles — conditional inclusion', () => {
  it('includes only frontend + JSON Schema + README by default options', () => {
    const files = generateExportFiles(contactFormSchema(), {
      frontend: true,
      jsonSchema: true,
      backend: 'none',
      database: 'none',
    })
    const paths = Object.keys(files)
    expect(paths).toContain('frontend/index.html')
    expect(paths).toContain('schema/form.schema.json')
    expect(paths).toContain('README.md')
    expect(paths.some((p) => p.startsWith('backend/'))).toBe(false)
    expect(paths.some((p) => p.startsWith('database/'))).toBe(false)
  })

  it('includes backend files when backend is php, independent of database', () => {
    const files = generateExportFiles(contactFormSchema(), {
      frontend: true,
      jsonSchema: true,
      backend: 'php',
      database: 'none',
    })
    expect(Object.keys(files)).toContain('backend/api/submit.php')
    expect(Object.keys(files)).not.toContain('database/schema.sql')
  })

  it('includes database/schema.sql only when database is mysql', () => {
    const files = generateExportFiles(contactFormSchema(), {
      frontend: true,
      jsonSchema: true,
      backend: 'php',
      database: 'mysql',
    })
    expect(Object.keys(files)).toContain('database/schema.sql')
  })

  it('supports JSON Schema without the HTML/CSS/JS frontend', () => {
    const files = generateExportFiles(contactFormSchema(), {
      frontend: false,
      jsonSchema: true,
      backend: 'none',
      database: 'none',
    })
    const paths = Object.keys(files)
    expect(paths).toEqual(['schema/form.schema.json', 'README.md'])
  })

  it('the README documents exactly what was included', () => {
    const files = generateExportFiles(contactFormSchema(), {
      frontend: true,
      jsonSchema: true,
      backend: 'php',
      database: 'mysql',
    })
    expect(files['README.md']).toContain('a PHP backend')
    expect(files['README.md']).toContain('DB_HOST')
  })
})

describe('toKebabSlug', () => {
  it('produces a portable, readable folder name', () => {
    expect(toKebabSlug('Contact Form')).toBe('contact-form')
    expect(toKebabSlug('  Weird!! Name??  ')).toBe('weird-name')
  })

  it('falls back for input that slugifies to nothing', () => {
    expect(toKebabSlug('!!!')).toBe('formforge-project')
  })
})
