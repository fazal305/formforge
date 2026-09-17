import './DatabaseDesigner.css'

/**
 * Shows the same field→column mapping the SQL generator reads (section 23)
 * — never a separately hand-maintained preview that could drift from the
 * actual CREATE TABLE output.
 */
export function DatabaseDesigner({ mapping }) {
  return (
    <div className="ff-database-designer">
      <table className="ff-database-designer__table">
        <thead>
          <tr>
            <th>Form Field</th>
            <th>Database Column</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((entry) => (
            <tr key={entry.field} data-stored={entry.stored}>
              <td>{entry.field}</td>
              <td className="mono">{entry.stored ? entry.column : '—'}</td>
              <td className="mono">{entry.stored ? entry.sqlType : 'not stored'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {mapping.some((entry) => entry.note) ? (
        <div className="ff-database-designer__notes">
          {mapping
            .filter((entry) => entry.note)
            .map((entry) => (
              <p key={entry.field}>
                <strong>{entry.field}</strong> — {entry.note}
              </p>
            ))}
        </div>
      ) : null}
    </div>
  )
}
