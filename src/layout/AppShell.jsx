import { useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useTheme } from '../theme/ThemeContext'
import { useBuilder } from '../builder/BuilderContext.jsx'
import { FieldLibrary } from '../builder/FieldLibrary.jsx'
import { FormCanvas } from '../builder/FormCanvas.jsx'
import { PropertiesInspector } from '../builder/PropertiesInspector.jsx'
import { PreviewRenderer } from '../preview/PreviewRenderer.jsx'
import { CodeViewer } from '../codeviewer/CodeViewer.jsx'
import { ExportDialog } from '../export/ExportDialog.jsx'
import { FormsDialog } from '../storage/FormsDialog.jsx'
import { getFieldDefinition } from '../schema/fieldRegistry.js'
import { FieldTypeIcon } from '../builder/fieldIcons.jsx'
import { IconButton, Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Modal } from '../components/ui/Modal.jsx'
import {
  SunIcon,
  MoonIcon,
  LibraryIcon,
  PropertiesIcon,
  UndoIcon,
  RedoIcon,
  FormsIcon,
} from '../components/ui/icons'
import './AppShell.css'

export function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const { schema, dispatch, undo, redo, canUndo, canRedo, selectedFieldId, selectField } =
    useBuilder()
  const [mobilePanel, setMobilePanel] = useState(null) // null | 'library' | 'inspector'
  const [activeDrag, setActiveDrag] = useState(null)
  const [isPreviewOpen, setPreviewOpen] = useState(false)
  const [isCodeViewerOpen, setCodeViewerOpen] = useState(false)
  const [isExportOpen, setExportOpen] = useState(false)
  const [isFormsOpen, setFormsOpen] = useState(false)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Keyboard shortcuts (section 70): Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo, Delete removes
  // the selected field, Escape clears selection. Skipped while typing in a form control.
  useEffect(() => {
    function isEditableTarget(target) {
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
    }

    function handleKeyDown(e) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (isEditableTarget(e.target)) return
      if (e.key === 'Escape') selectField(null)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFieldId) dispatch({ type: 'DELETE_FIELD', fieldId: selectedFieldId })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, dispatch, selectedFieldId, selectField])

  function handleDragStart(event) {
    setActiveDrag(event.active.data.current)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveDrag(null)
    if (!over) return

    const isFromLibrary = active.data.current?.source === 'library'

    if (isFromLibrary) {
      const overIndex = schema.fields.findIndex((f) => f.id === over.id)
      const atIndex = overIndex === -1 ? schema.fields.length : overIndex
      dispatch({ type: 'ADD_FIELD', fieldType: active.data.current.fieldType, atIndex })
      return
    }

    if (active.id !== over.id) {
      const toIndex = schema.fields.findIndex((f) => f.id === over.id)
      if (toIndex !== -1) {
        dispatch({ type: 'MOVE_FIELD', fieldId: active.id, toIndex })
      }
    }
  }

  const dragDefinition = activeDrag?.fieldType ? getFieldDefinition(activeDrag.fieldType) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="ff-shell">
        <header className="ff-shell__header">
          <div className="ff-shell__brand">
            <span className="ff-shell__brand-mark" aria-hidden="true">
              FF
            </span>
            <span className="ff-shell__brand-name">FormForge</span>
          </div>

          <div className="ff-shell__header-actions">
            <IconButton label="My forms" onClick={() => setFormsOpen(true)}>
              <FormsIcon size={16} />
            </IconButton>
            <IconButton label="Undo" onClick={undo} disabled={!canUndo}>
              <UndoIcon size={16} />
            </IconButton>
            <IconButton label="Redo" onClick={redo} disabled={!canRedo}>
              <RedoIcon size={16} />
            </IconButton>
            <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCodeViewerOpen(true)}>
              Generate
            </Button>
            <Button variant="primary" size="sm" onClick={() => setExportOpen(true)}>
              Export
            </Button>
            <IconButton
              label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
            >
              {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </IconButton>
          </div>
        </header>

        <div className="ff-shell__body">
          <aside className="ff-shell__library" data-open={mobilePanel === 'library'}>
            <Panel title="Field Library">
              <FieldLibrary />
            </Panel>
          </aside>

          <main className="ff-shell__canvas">
            <Panel title="Form Canvas">
              <FormCanvas />
            </Panel>
          </main>

          <aside className="ff-shell__inspector" data-open={mobilePanel === 'inspector'}>
            <Panel title={selectedFieldId ? 'Field Properties' : 'Form Settings'}>
              <PropertiesInspector />
            </Panel>
          </aside>

          {mobilePanel ? (
            <button
              className="ff-shell__scrim"
              aria-label="Close panel"
              onClick={() => setMobilePanel(null)}
            />
          ) : null}
        </div>

        <nav className="ff-shell__mobile-toolbar" aria-label="Builder panels">
          <button
            className="ff-shell__mobile-toolbar-item"
            data-active={mobilePanel === 'library'}
            onClick={() => setMobilePanel((current) => (current === 'library' ? null : 'library'))}
          >
            <LibraryIcon size={16} />
            Fields
          </button>
          <button
            className="ff-shell__mobile-toolbar-item"
            data-active={mobilePanel === 'inspector'}
            onClick={() =>
              setMobilePanel((current) => (current === 'inspector' ? null : 'inspector'))
            }
          >
            <PropertiesIcon size={16} />
            Properties
          </button>
        </nav>
      </div>

      <DragOverlay>
        {dragDefinition ? (
          <div className="ff-drag-overlay">
            <FieldTypeIcon iconKey={dragDefinition.icon} />
            <span>{dragDefinition.label}</span>
          </div>
        ) : null}
      </DragOverlay>

      {isPreviewOpen ? (
        <Modal title={`Preview — ${schema.name}`} onClose={() => setPreviewOpen(false)}>
          <PreviewRenderer schema={schema} />
        </Modal>
      ) : null}

      {isCodeViewerOpen ? (
        <Modal
          title={`Generated code — ${schema.name}`}
          size="large"
          onClose={() => setCodeViewerOpen(false)}
        >
          <CodeViewer schema={schema} />
        </Modal>
      ) : null}

      {isExportOpen ? (
        <Modal title={`Export — ${schema.name}`} onClose={() => setExportOpen(false)}>
          <ExportDialog schema={schema} onClose={() => setExportOpen(false)} />
        </Modal>
      ) : null}

      {isFormsOpen ? (
        <Modal title="My Forms" onClose={() => setFormsOpen(false)}>
          <FormsDialog onClose={() => setFormsOpen(false)} />
        </Modal>
      ) : null}
    </DndContext>
  )
}
