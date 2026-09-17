import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createEmptyForm } from '../schema/createSchema.js'
import { loadDraft, saveDraft } from '../schema/persistence.js'
import { useSchemaHistory } from './useSchemaHistory.js'

const BuilderContext = createContext(null)

export function BuilderProvider({ children }) {
  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const history = useSchemaHistory(() => loadDraft() ?? createEmptyForm())

  // Autosave the working draft — this is the local-first "no account needed" path (section 34/67).
  useEffect(() => {
    saveDraft(history.schema)
  }, [history.schema])

  // Keep selection valid if the selected field was deleted, or by undo/redo.
  useEffect(() => {
    if (selectedFieldId && !history.schema.fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(null)
    }
  }, [history.schema, selectedFieldId])

  // Selecting the field a user just added makes the result of "add field" visible
  // immediately in the properties panel, instead of leaving them to hunt for it.
  const idsBeforeAdd = useRef(null)
  const dispatch = useCallback(
    (action) => {
      if (action.type === 'ADD_FIELD') {
        idsBeforeAdd.current = new Set(history.schema.fields.map((f) => f.id))
      }
      history.dispatch(action)
    },
    [history],
  )

  useEffect(() => {
    if (!idsBeforeAdd.current) return
    const added = history.schema.fields.find((f) => !idsBeforeAdd.current.has(f.id))
    idsBeforeAdd.current = null
    if (added) setSelectedFieldId(added.id)
  }, [history.schema])

  const value = {
    schema: history.schema,
    dispatch,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    loadSchema: history.reset,
    selectedFieldId,
    selectField: setSelectedFieldId,
  }

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within a BuilderProvider')
  return ctx
}
