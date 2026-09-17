import { useCallback, useRef, useState } from 'react'
import { schemaReducer } from '../schema/schemaReducer.js'

const HISTORY_LIMIT = 50

/**
 * Wraps schemaReducer with a bounded undo/redo stack. A simple array of
 * immutable snapshots is enough here — form schemas are small JSON, so a
 * command-pattern/diff-based history would be solving a performance problem
 * this data size doesn't have. History is UI-workflow state, so it lives
 * here, not inside schemaReducer itself, which stays a plain pure function.
 */
export function useSchemaHistory(initialSchema) {
  const [present, setPresent] = useState(initialSchema)
  const past = useRef([])
  const future = useRef([])
  const [, forceRender] = useState(0)

  const dispatch = useCallback((action) => {
    setPresent((current) => {
      const next = schemaReducer(current, action)
      if (next === current) return current

      past.current = [...past.current, current].slice(-HISTORY_LIMIT)
      future.current = []
      return next
    })
  }, [])

  /** Replaces the schema outright (import/load) without it becoming an undo step back to the old form. */
  const reset = useCallback((schema) => {
    past.current = []
    future.current = []
    setPresent(schema)
  }, [])

  const undo = useCallback(() => {
    setPresent((current) => {
      if (past.current.length === 0) return current
      const previous = past.current[past.current.length - 1]
      past.current = past.current.slice(0, -1)
      future.current = [current, ...future.current]
      return previous
    })
  }, [])

  const redo = useCallback(() => {
    setPresent((current) => {
      if (future.current.length === 0) return current
      const [next, ...rest] = future.current
      future.current = rest
      past.current = [...past.current, current]
      return next
    })
  }, [])

  // past/future are refs (so undo/redo don't themselves trigger extra renders
  // beyond the schema change) — bump a counter so canUndo/canRedo stay fresh.
  const notify = useCallback(() => forceRender((n) => n + 1), [])

  return {
    schema: present,
    dispatch: useCallback(
      (action) => {
        dispatch(action)
        notify()
      },
      [dispatch, notify],
    ),
    undo: useCallback(() => {
      undo()
      notify()
    }, [undo, notify]),
    redo: useCallback(() => {
      redo()
      notify()
    }, [redo, notify]),
    reset: useCallback(
      (schema) => {
        reset(schema)
        notify()
      },
      [reset, notify],
    ),
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}
