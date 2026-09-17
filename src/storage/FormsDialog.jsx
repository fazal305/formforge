import { useRef, useState } from 'react'
import { useBuilder } from '../builder/BuilderContext.jsx'
import { validateSchema } from '../schema/validateSchema.js'
import { downloadSchemaJson, readSchemaFile } from '../schema/schemaFile.js'
import { listSavedForms, saveForm, getSavedForm, deleteSavedForm } from '../schema/persistence.js'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/Panel.jsx'
import './FormsDialog.css'

/**
 * Distinct from the ZIP export: this saves/loads the editable FormForge
 * design itself (section 33), either to this browser's storage or as a
 * portable .json file — never trusting an imported file until it passes
 * the same validateSchema() that guards localStorage reads (section 56).
 */
export function FormsDialog({ onClose }) {
  const { schema, loadSchema } = useBuilder()
  const [savedForms, setSavedForms] = useState(() => listSavedForms())
  const [importError, setImportError] = useState(null)
  const [saveConfirmation, setSaveConfirmation] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const fileInputRef = useRef(null)

  function refreshList() {
    setSavedForms(listSavedForms())
  }

  function handleSave() {
    saveForm(schema)
    refreshList()
    setSaveConfirmation(true)
    setTimeout(() => setSaveConfirmation(false), 1500)
  }

  function handleOpen(id) {
    const found = getSavedForm(id)
    if (found) {
      loadSchema(found)
      onClose()
    }
  }

  function handleDeleteClick(id) {
    if (pendingDeleteId === id) {
      deleteSavedForm(id)
      setPendingDeleteId(null)
      refreshList()
    } else {
      setPendingDeleteId(id)
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files[0]
    event.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    setImportError(null)
    try {
      const candidate = await readSchemaFile(file)
      const { valid, errors } = validateSchema(candidate)
      if (!valid) {
        setImportError(errors.join(' '))
        return
      }
      loadSchema(candidate)
      onClose()
    } catch (error) {
      setImportError(error.message)
    }
  }

  return (
    <div className="ff-forms-dialog">
      <section className="ff-forms-dialog__section">
        <h3>Current form</h3>
        <div className="ff-forms-dialog__actions">
          <Button variant="secondary" size="sm" onClick={handleSave}>
            {saveConfirmation ? 'Saved!' : 'Save to this browser'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => downloadSchemaJson(schema)}>
            Export as JSON
          </Button>
        </div>
      </section>

      <section className="ff-forms-dialog__section">
        <h3>Import</h3>
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          Choose a .json file
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleImportFile}
        />
        {importError ? (
          <p className="ff-forms-dialog__error" role="alert">
            {importError}
          </p>
        ) : null}
      </section>

      <section className="ff-forms-dialog__section">
        <h3>Saved forms</h3>
        {savedForms.length === 0 ? (
          <EmptyState title="No saved forms yet" description="Forms you save stay in this browser." />
        ) : (
          <ul className="ff-forms-dialog__list">
            {savedForms.map((form) => (
              <li key={form.id}>
                <button className="ff-forms-dialog__list-name" onClick={() => handleOpen(form.id)}>
                  {form.name}
                </button>
                <span className="ff-forms-dialog__list-date">
                  {new Date(form.updatedAt).toLocaleDateString()}
                </span>
                <button
                  className="ff-forms-dialog__list-delete"
                  data-pending={pendingDeleteId === form.id}
                  aria-label={`Delete ${form.name}`}
                  onClick={() => handleDeleteClick(form.id)}
                >
                  {pendingDeleteId === form.id ? 'Confirm?' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
