import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // <-- adicionado
import './i18n'; // initialize i18n

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> {/* <-- envolver a App */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)
