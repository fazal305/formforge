import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './Button.jsx'
import { CloseIcon } from './icons.jsx'
import './Modal.css'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, children, footer, size = 'default' }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)

  // Separate from the keydown-listener effect below: this must run exactly
  // once on mount. onClose is an inline arrow function at every call site,
  // so a listener effect keyed on it (needed there, to keep Escape closing
  // with the latest handler) re-runs on every parent re-render — if this
  // focus call lived in that effect, any unrelated re-render while the
  // modal was open would silently steal focus back to the close button,
  // undoing whatever the focus trap or the user had just done.
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: Tab/Shift+Tab wrap within the dialog instead of escaping
      // to the (visually hidden, but still tabbable) page behind it.
      if (e.key === 'Tab' && dialogRef.current) {
        // offsetParent is null for display:none (and our [hidden] file inputs) —
        // querySelectorAll alone would include them, and .focus() on an
        // unfocusable element silently no-ops, breaking the wrap.
        const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="ff-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={`ff-modal ff-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="ff-modal__header">
          <h2 className="ff-modal__title">{title}</h2>
          <IconButton label="Close" onClick={onClose} ref={closeButtonRef}>
            <CloseIcon size={16} />
          </IconButton>
        </header>
        <div className="ff-modal__body">{children}</div>
        {footer ? <footer className="ff-modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
