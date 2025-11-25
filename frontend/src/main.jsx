import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 2. Wrap your entire <App /> */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
