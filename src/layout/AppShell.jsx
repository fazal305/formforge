import { useState } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { IconButton, Button } from '../components/ui/Button'
import { Panel, EmptyState } from '../components/ui/Panel'
import { SunIcon, MoonIcon, LibraryIcon, PropertiesIcon } from '../components/ui/icons'
import './AppShell.css'

/**
 * Structural shell for the builder workspace. The three panels below are
 * placeholders — the Field Library, Canvas and Properties Inspector are
 * implemented in the Visual Builder phase. This phase only establishes the
 * layout, responsive behavior, and panel chrome they will be rendered into.
 */
export function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const [mobilePanel, setMobilePanel] = useState(null) // null | 'library' | 'inspector'

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="ff-shell">
      <header className="ff-shell__header">
        <div className="ff-shell__brand">
          <span className="ff-shell__brand-mark" aria-hidden="true">
            FF
          </span>
          <span className="ff-shell__brand-name">FormForge</span>
        </div>

        <div className="ff-shell__header-actions">
          <Button variant="ghost" size="sm" disabled>
            Preview
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Generate
          </Button>
          <Button variant="primary" size="sm" disabled>
            Export
          </Button>
          <IconButton
            label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
        </div>
      </header>

      <div className="ff-shell__body">
        <aside className="ff-shell__library" data-open={mobilePanel === 'library'}>
          <Panel title="Field Library">
            <EmptyState
              icon={<LibraryIcon />}
              title="Field library coming next"
              description="Field types will be listed here for click-to-add or drag onto the canvas."
            />
          </Panel>
        </aside>

        <main className="ff-shell__canvas">
          <Panel title="Form Canvas">
            <EmptyState
              title="Start building your form"
              description="Drag a field here or choose one from the field library."
            />
          </Panel>
        </main>

        <aside className="ff-shell__inspector" data-open={mobilePanel === 'inspector'}>
          <Panel title="Properties">
            <EmptyState
              icon={<PropertiesIcon />}
              title="No field selected"
              description="Select a field on the canvas to edit its properties."
            />
          </Panel>
        </aside>

        {mobilePanel ? (
          <button
            className="ff-shell__scrim"
            aria-label="Close panel"
            onClick={() => setMobilePanel(null)}
          />
        ) : null}
      </div>

      <nav className="ff-shell__mobile-toolbar" aria-label="Builder panels">
        <button
          className="ff-shell__mobile-toolbar-item"
          data-active={mobilePanel === 'library'}
          onClick={() => setMobilePanel((current) => (current === 'library' ? null : 'library'))}
        >
          <LibraryIcon />
          Fields
        </button>
        <button
          className="ff-shell__mobile-toolbar-item"
          data-active={mobilePanel === 'inspector'}
          onClick={() =>
            setMobilePanel((current) => (current === 'inspector' ? null : 'inspector'))
          }
        >
          <PropertiesIcon />
          Properties
        </button>
      </nav>
    </div>
  )
}
