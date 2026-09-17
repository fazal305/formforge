import { ThemeProvider } from './theme/ThemeContext'
import { AppShell } from './layout/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
