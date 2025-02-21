if (typeof window !== "undefined") {
  console.log = () => {};  // Suppresses user logs
  console.warn = () => {}; // Suppresses warnings
  console.error = () => {}; // Suppresses errors
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
)
