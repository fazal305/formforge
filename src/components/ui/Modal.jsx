import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './Button.jsx'
import { CloseIcon } from './icons.jsx'
import './Modal.css'

export function Modal({ title, onClose, children, footer }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="ff-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-modal" role="dialog" aria-modal="true" aria-label={title}>
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
