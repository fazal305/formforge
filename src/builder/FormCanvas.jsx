import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { EmptyState } from '../components/ui/Panel.jsx'
import { useBuilder } from './BuilderContext.jsx'
import { FieldRow } from './FieldRow.jsx'
import './FormCanvas.css'

export function FormCanvas() {
  const { schema } = useBuilder()
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })
  const fieldIds = schema.fields.map((f) => f.id)

  return (
    <div ref={setNodeRef} className="ff-form-canvas" data-drop-active={isOver}>
      {schema.fields.length === 0 ? (
        <EmptyState
          title="Start building your form"
          description="Drag a field here or choose one from the field library."
        />
      ) : (
        <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
          <div className="ff-form-canvas__list">
            {schema.fields.map((field) => (
              <FieldRow key={field.id} field={field} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}
