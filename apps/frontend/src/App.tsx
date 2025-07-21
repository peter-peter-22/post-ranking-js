import Router from './routes/router'
import { theme } from './assets/theme'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import TanstackProvider from './components/contexts/TanstackProvider'
import "./assets/global.css"
import { ConfirmDialogProvider } from './components/contexts/ConfirmDialog'

function App() {
  return (
    <TanstackProvider>
      <ThemeProvider theme={theme}>
        <ConfirmDialogProvider>
          <CssBaseline />
          <Router />
        </ConfirmDialogProvider>
      </ThemeProvider>
    </TanstackProvider>
  )
}

export default App
