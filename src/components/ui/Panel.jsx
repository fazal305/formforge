import './Panel.css'

export function Panel({ title, actions, children, className = '', ...rest }) {
  return (
    <section className={`ff-panel ${className}`.trim()} {...rest}>
      {title ? (
        <header className="ff-panel__header">
          <h2 className="ff-panel__title">{title}</h2>
          {actions ? <div className="ff-panel__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="ff-panel__body">{children}</div>
    </section>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="ff-empty-state">
      {icon ? <div className="ff-empty-state__icon">{icon}</div> : null}
      <p className="ff-empty-state__title">{title}</p>
      {description ? <p className="ff-empty-state__description">{description}</p> : null}
      {action ? <div className="ff-empty-state__action">{action}</div> : null}
    </div>
  )
}
