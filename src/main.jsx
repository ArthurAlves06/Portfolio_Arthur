import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // <-- adicionado
import './i18n'; // initialize i18n
import { /* trackEvent, seedAnalyticsDemo, refreshAnalyticsEvents */ } from './utils/analytics';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> {/* <-- envolver a App */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)

// Expose helper for quick manual testing in development only
// Debug helpers removed — no dev globals exposed
