import { ThemeProvider } from './theme/ThemeContext'
import { BuilderProvider } from './builder/BuilderContext.jsx'
import { AppShell } from './layout/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <BuilderProvider>
        <AppShell />
      </BuilderProvider>
    </ThemeProvider>
  )
}
