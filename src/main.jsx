import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AdminApp from './admin/AdminApp.jsx'
import PVViewer from './components/PVViewer.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Admin panel */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* AMR task viewer */}
          <Route path="/:warehouseOrderId/task/:taskId" element={<PVViewer />} />

          {/* Development mode */}
          <Route path="/dev" element={<PVViewer />} />

          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)