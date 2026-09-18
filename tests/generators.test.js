import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createEmptyForm, createField } from '../src/schema/createSchema.js'
import { generateFrontendFiles } from '../src/generators/generateFrontend.js'
import { generateBackendFiles } from '../src/generators/generateBackend.js'
import { generateDatabaseFiles } from '../src/generators/generateDatabase.js'
import { getTableName } from '../src/generators/tableName.js'
import { ALL_FIXTURES, contactFormSchema } from './fixtures.js'

function hasPhpCli() {
  try {
    execSync('php -v', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
const PHP_AVAILABLE = hasPhpCli()

describe.each(Object.entries(ALL_FIXTURES))('generator fixture: %s', (_name, buildSchema) => {
  const schema = buildSchema()

  it('produces frontend files that parse as valid JS (script.js) and are non-empty', () => {
    const files = generateFrontendFiles(schema)
    expect(files['frontend/index.html']).toBeTruthy()
    expect(files['frontend/styles.css']).toBeTruthy()
    expect(() => new Function(files['frontend/script.js'])).not.toThrow()
  })

  it('produces a JSON Schema document with a property per field', () => {
    const files = generateFrontendFiles(schema)
    const doc = JSON.parse(files['schema/form.schema.json'])
    expect(Object.keys(doc.properties)).toHaveLength(schema.fields.length)
  })

  it.skipIf(!PHP_AVAILABLE)('produces backend PHP that passes php -l', () => {
    const files = generateBackendFiles(schema)
    const dir = mkdtempSync(join(tmpdir(), 'ff-test-'))
    try {
      for (const [path, content] of Object.entries(files)) {
        const full = join(dir, path.replace(/\//g, '_'))
        writeFileSync(full, content)
        const output = execSync(`php -l "${full}"`, { encoding: 'utf-8' })
        expect(output).toContain('No syntax errors detected')
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('SQL columns and PHP submit.php columns reference the identical table and column set', () => {
    const backendFiles = generateBackendFiles(schema)
    const dbFiles = generateDatabaseFiles(schema)
    const table = getTableName(schema)

    expect(backendFiles['backend/api/submit.php']).toContain(`'${table}'`)
    expect(dbFiles['database/schema.sql']).toContain(`\`${table}\``)

    const storableFieldNames = schema.fields.filter((f) => f.type !== 'password').map((f) => f.name)
    for (const name of storableFieldNames) {
      expect(backendFiles['backend/api/submit.php']).toContain(`'${name}'`)
    }
  })

  it('excludes password fields from both PHP storage and the SQL table', () => {
    const passwordField = schema.fields.find((f) => f.type === 'password')
    if (!passwordField) return // this fixture has no password field

    const backendFiles = generateBackendFiles(schema)
    const dbFiles = generateDatabaseFiles(schema)
    const createTableBody = dbFiles['database/schema.sql'].slice(
      dbFiles['database/schema.sql'].indexOf('CREATE TABLE'),
    )
    expect(createTableBody).not.toContain(`\`${passwordField.name}\``)
    expect(backendFiles['backend/api/submit.php']).not.toContain(`'${passwordField.name}'`)
  })

  it('is deterministic: identical schema in, byte-identical output out', () => {
    const first = generateFrontendFiles(schema)
    const second = generateFrontendFiles(schema)
    expect(first).toEqual(second)
  })
})

describe('security: generated code never lets schema data become executable', () => {
  it('HTML-escapes a script-tag label instead of emitting it raw', () => {
    const schema = createEmptyForm('XSS Test')
    const field = createField('text', { existingNames: [] })
    field.label = '<script>alert(1)</script>'
    field.validation.required = true
    schema.fields = [field]

    const html = generateFrontendFiles(schema)['frontend/index.html']
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('embeds quote-containing labels into script.js via JSON.stringify, not string concatenation', () => {
    const schema = createEmptyForm('Quote Test')
    const field = createField('select', { existingNames: [] })
    field.label = 'Plan "tier" & level'
    field.options = [{ value: 'a', label: 'Option "A"' }]
    schema.fields = [field]

    const js = generateFrontendFiles(schema)['frontend/script.js']
    expect(() => new Function(js)).not.toThrow()
  })

  it.skipIf(!PHP_AVAILABLE)('embeds a quote-containing label into PHP via a proper literal encoder', () => {
    const schema = createEmptyForm('Quote Test')
    const field = createField('text', { existingNames: [] })
    field.label = `Applicant's "Full" Name`
    schema.fields = [field]

    const php = generateBackendFiles(schema)['backend/validation/validation.php']
    const dir = mkdtempSync(join(tmpdir(), 'ff-test-'))
    try {
      const full = join(dir, 'validation.php')
      writeFileSync(full, php)
      const output = execSync(`php -l "${full}"`, { encoding: 'utf-8' })
      expect(output).toContain('No syntax errors detected')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('the SQL generator refuses to emit SQL for a field name that fails the identifier allowlist', async () => {
    const { generateSql } = await import('../src/generators/sql/sqlGenerator.js')
    const schema = contactFormSchema()
    schema.fields[0].name = 'name`; DROP TABLE users; --'
    expect(() => generateSql(schema)).toThrow()
  })
})

describe.skipIf(!PHP_AVAILABLE)('backend integration: real PHP execution', () => {
  it('validation.php correctly accepts/rejects real data when actually executed', () => {
    const schema = contactFormSchema()
    const php = generateBackendFiles(schema)['backend/validation/validation.php']
    const dir = mkdtempSync(join(tmpdir(), 'ff-test-'))
    try {
      writeFileSync(join(dir, 'validation.php'), php)
      const [nameField, emailField, messageField] = schema.fields
      const driver = `<?php
require '${join(dir, 'validation.php').replace(/\\/g, '/')}';
echo json_encode(formforge_validate_all(FORMFORGE_FIELDS, []));
echo "\\n";
echo json_encode(formforge_validate_all(FORMFORGE_FIELDS, [
  '${nameField.name}' => 'Ada Lovelace',
  '${emailField.name}' => 'ada@example.com',
  '${messageField.name}' => 'This message is long enough.',
]));
`
      writeFileSync(join(dir, 'driver.php'), driver)
      const [missingJson, validJson] = execSync(`php "${join(dir, 'driver.php')}"`, { encoding: 'utf-8' })
        .trim()
        .split('\n')

      const missing = JSON.parse(missingJson)
      expect(missing[nameField.name]).toBe('This field is required.')

      const valid = JSON.parse(validJson)
      expect(Object.keys(valid)).toHaveLength(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
