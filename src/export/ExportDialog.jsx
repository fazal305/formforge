import { useState } from 'react'
import { createDefaultExportOptions } from './exportOptions.js'
import { buildProjectZip } from './buildZip.js'
import { Button } from '../components/ui/Button.jsx'
import { ToggleControl } from '../builder/controls/FieldControls.jsx'
import './ExportDialog.css'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ExportDialog({ schema, onClose }) {
  const [options, setOptions] = useState(() => createDefaultExportOptions(schema))
  const [status, setStatus] = useState('idle') // idle | preparing | success | error
  const [errorMessage, setErrorMessage] = useState('')

  function patch(next) {
    setOptions((current) => ({ ...current, ...next }))
  }

  async function handleExport() {
    setStatus('preparing')
    try {
      const { blob, filename } = await buildProjectZip(schema, options)
      downloadBlob(blob, filename)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="ff-export-dialog">
      <ToggleControl
        label="Frontend (HTML, CSS, JavaScript)"
        value={options.frontend}
        onChange={(value) => patch({ frontend: value })}
      />
      <ToggleControl
        label="JSON Schema"
        value={options.jsonSchema}
        onChange={(value) => patch({ jsonSchema: value })}
      />

      <label className="ff-export-dialog__select">
        <span className="ff-control__label">Backend</span>
        <select
          className="ff-control__input"
          value={options.backend}
          onChange={(e) => patch({ backend: e.target.value })}
        >
          <option value="none">None</option>
          <option value="php">PHP</option>
        </select>
      </label>

      <label className="ff-export-dialog__select">
        <span className="ff-control__label">Database</span>
        <select
          className="ff-control__input"
          value={options.database}
          onChange={(e) => patch({ database: e.target.value })}
        >
          <option value="none">None</option>
          <option value="mysql">MySQL</option>
        </select>
      </label>

      {status === 'error' ? (
        <p className="ff-export-dialog__error" role="alert">
          {errorMessage} — <button onClick={handleExport}>try again</button>
        </p>
      ) : null}

      {status === 'success' ? (
        <p className="ff-export-dialog__success">Download started.</p>
      ) : null}

      <div className="ff-export-dialog__footer">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleExport} disabled={status === 'preparing'}>
          {status === 'preparing' ? 'Preparing…' : 'Download ZIP'}
        </Button>
      </div>
    </div>
  )
}
