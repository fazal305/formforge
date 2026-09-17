import { forwardRef } from 'react'
import './Button.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger']

export function Button({ variant = 'secondary', size = 'md', children, className = '', ...rest }) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'secondary'
  return (
    <button
      className={`ff-button ff-button--${safeVariant} ff-button--${size} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}

export const IconButton = forwardRef(function IconButton(
  { label, children, active = false, className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`ff-icon-button ${active ? 'is-active' : ''} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  )
})
