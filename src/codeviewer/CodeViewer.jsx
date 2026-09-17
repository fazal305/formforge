import { useMemo, useState } from 'react'
import { generateProjectFiles } from '../generators/generateProject.js'
import { buildColumnMapping } from '../generators/sql/columnMapping.js'
import { highlightCode } from './highlight.js'
import { Button } from '../components/ui/Button.jsx'
import { DatabaseDesigner } from './DatabaseDesigner.jsx'
import './CodeViewer.css'
import './prism-theme.css'

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  schema: 'JSON Schema',
  backend: 'Backend (PHP)',
  database: 'Database',
}

function groupFiles(files) {
  const groups = new Map()
  for (const path of Object.keys(files)) {
    const category = path.split('/')[0]
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(path)
  }
  return groups
}

function CopyButton({ content }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable (permissions, insecure context) — nothing to recover into here.
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )
}

function downloadFile(path, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = path.split('/').pop()
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Displays every file the generators currently produce from this schema —
 * this must never fake or hand-author content; it renders exactly what
 * generateProjectFiles() returns (section 31).
 */
export function CodeViewer({ schema }) {
  const files = useMemo(() => generateProjectFiles(schema), [schema])
  const groups = useMemo(() => groupFiles(files), [files])
  const mapping = useMemo(() => buildColumnMapping(schema), [schema])

  const allPaths = Object.keys(files)
  const [selected, setSelected] = useState(() => allPaths[0] ?? null)
  const [showMapping, setShowMapping] = useState(false)

  const activePath = showMapping ? null : selected
  const activeContent = activePath ? files[activePath] : ''
  const highlighted = useMemo(
    () => (activePath ? highlightCode(activeContent, activePath) : ''),
    [activePath, activeContent],
  )

  return (
    <div className="ff-code-viewer">
      <nav className="ff-code-viewer__files" aria-label="Generated files">
        {[...groups.entries()].map(([category, paths]) => (
          <div className="ff-code-viewer__group" key={category}>
            <h3 className="ff-code-viewer__group-title">{CATEGORY_LABELS[category] ?? category}</h3>
            {paths.map((path) => (
              <button
                key={path}
                className="ff-code-viewer__file"
                data-active={!showMapping && selected === path}
                onClick={() => {
                  setSelected(path)
                  setShowMapping(false)
                }}
              >
                {path.split('/').pop()}
              </button>
            ))}
            {category === 'database' ? (
              <button
                className="ff-code-viewer__file"
                data-active={showMapping}
                onClick={() => setShowMapping(true)}
              >
                Database Designer
              </button>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="ff-code-viewer__content">
        {showMapping ? (
          <DatabaseDesigner mapping={mapping} />
        ) : activePath ? (
          <>
            <div className="ff-code-viewer__toolbar">
              <span className="ff-code-viewer__path mono">{activePath}</span>
              <div className="ff-code-viewer__actions">
                <CopyButton content={activeContent} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadFile(activePath, activeContent)}
                >
                  Download
                </Button>
              </div>
            </div>
            <div className="ff-code">
              <pre>
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
