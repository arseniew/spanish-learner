import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// DO NOT import './data.ts' here - App.tsx handles its loading.
// Importing it here might cause issues if it doesn't exist yet.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
