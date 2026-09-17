import { useDraggable } from '@dnd-kit/core'
import { listFieldDefinitionsByCategory } from '../schema/fieldRegistry.js'
import { useBuilder } from './BuilderContext.jsx'
import { FieldTypeIcon } from './fieldIcons.jsx'
import './FieldLibrary.css'

const CATEGORY_LABELS = {
  basic: 'Basic',
  choice: 'Choice',
  datetime: 'Date & time',
  advanced: 'Advanced',
}

function LibraryItem({ definition }) {
  const { dispatch } = useBuilder()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${definition.type}`,
    data: { source: 'library', fieldType: definition.type },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="ff-library-item"
      data-dragging={isDragging}
      onClick={() => dispatch({ type: 'ADD_FIELD', fieldType: definition.type })}
      {...listeners}
      {...attributes}
    >
      <FieldTypeIcon iconKey={definition.icon} />
      <span>{definition.label}</span>
    </button>
  )
}

/**
 * Click-to-add is the primary path (works for every input method, satisfies
 * accessibility without a separate "alternative"); each item is also
 * draggable onto the canvas as an enhancement, not a requirement.
 */
export function FieldLibrary() {
  const grouped = listFieldDefinitionsByCategory()

  return (
    <div className="ff-field-library">
      {Object.entries(grouped).map(([category, definitions]) => (
        <div className="ff-field-library__group" key={category}>
          <h3 className="ff-field-library__group-title">{CATEGORY_LABELS[category] ?? category}</h3>
          <div className="ff-field-library__items">
            {definitions.map((definition) => (
              <LibraryItem key={definition.type} definition={definition} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
