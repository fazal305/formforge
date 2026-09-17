/**
 * Maps a field to a proposed database column. This is the single source
 * the SQL generator and the (future) Database Designer preview both read —
 * showing the user the same mapping that gets turned into SQL, never a
 * second hand-maintained guess (section 23).
 *
 * Not every field maps cleanly onto one column; that's made explicit via
 * `stored: false` rather than silently guessing (section 22).
 */
export function mapFieldToColumn(field) {
  const base = { field: field.name, column: field.name, stored: true, nullable: !field.validation?.required }

  switch (field.type) {
    case 'password':
      return {
        ...base,
        stored: false,
        sqlType: null,
        note: 'Password fields are never persisted — storing submitted credentials, even hashed, is out of scope for a generic submissions table.',
      }
    case 'file':
      return {
        ...base,
        sqlType: 'VARCHAR(255)',
        note: 'Stores the server-generated stored filename, not the file content — see backend/api/submit.php.',
      }
    case 'textarea':
      return { ...base, sqlType: 'TEXT' }
    case 'number':
      return {
        ...base,
        sqlType: 'INT',
        note: 'Decimal/float input is not distinguished in v1 — all numbers map to INT.',
      }
    case 'checkbox':
      return { ...base, sqlType: 'TINYINT(1)' }
    case 'date':
      return { ...base, sqlType: 'DATE' }
    case 'time':
      return { ...base, sqlType: 'TIME' }
    case 'select':
    case 'radio':
      return {
        ...base,
        sqlType: 'VARCHAR(255)',
        note: 'Stores the selected option value as text rather than SQL ENUM, so changing the field\'s options later never requires an ALTER TABLE.',
      }
    case 'email':
    case 'url':
    case 'phone':
    case 'text':
    case 'hidden':
    default:
      return { ...base, sqlType: 'VARCHAR(255)' }
  }
}

/** The full proposed mapping for a schema, in field order — what the Database Designer preview renders. */
export function buildColumnMapping(schema) {
  return schema.fields.map(mapFieldToColumn)
}
