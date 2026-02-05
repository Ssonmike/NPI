import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import PVViewer from './components/PVViewer.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* AMR task viewer - production URL pattern */}
          <Route path="/:warehouseOrderId/task/:taskId" element={<PVViewer />} />

          {/* Development/testing mode - root shows 3D viewer */}
          <Route path="/" element={<PVViewer />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)