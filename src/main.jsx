import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AdminApp from './admin/AdminApp.jsx'
import PVViewer from './components/PVViewer.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Admin panel routes */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* AMR task viewer route */}
          <Route path="/:warehouseOrderId/task/:taskId" element={<PVViewer />} />

          {/* Development mode / default route */}
          <Route path="/" element={<PVViewer />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

