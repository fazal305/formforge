import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getFieldDefinition } from '../schema/fieldRegistry.js'
import { getPath } from '../schema/path.js'
import { useBuilder } from './BuilderContext.jsx'
import { FieldTypeIcon } from './fieldIcons.jsx'
import { IconButton } from '../components/ui/Button.jsx'
import { GripIcon, DuplicateIcon, DeleteIcon } from '../components/ui/icons.jsx'
import './FieldRow.css'

export function FieldRow({ field }) {
  const { dispatch, selectedFieldId, selectField } = useBuilder()
  const definition = getFieldDefinition(field.type)
  const isSelected = field.id === selectedFieldId
  const required = getPath(field, 'validation.required') === true

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="ff-field-row"
      data-selected={isSelected}
      data-dragging={isDragging}
      onClick={() => selectField(field.id)}
    >
      <button
        className="ff-field-row__grip"
        aria-label={`Reorder ${field.label}`}
        {...attributes}
        {...listeners}
      >
        <GripIcon size={14} />
      </button>

      <div className="ff-field-row__icon">
        <FieldTypeIcon iconKey={definition?.icon} />
      </div>

      <div className="ff-field-row__body">
        <span className="ff-field-row__label">
          {field.label}
          {required ? <span className="ff-field-row__required">*</span> : null}
        </span>
        <span className="ff-field-row__meta">
          {definition?.label ?? field.type} · {field.name}
        </span>
      </div>

      <div className="ff-field-row__actions">
        <IconButton
          label="Duplicate field"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'DUPLICATE_FIELD', fieldId: field.id })
          }}
        >
          <DuplicateIcon size={14} />
        </IconButton>
        <IconButton
          label="Delete field"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'DELETE_FIELD', fieldId: field.id })
          }}
        >
          <DeleteIcon size={14} />
        </IconButton>
      </div>
    </div>
  )
}
