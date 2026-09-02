import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './ui/AppLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import Employees from './pages/Employees.jsx'
import WorkTracker from './pages/WorkTracker.jsx'
import Invoices from './pages/Invoices.jsx'
import Attendance from './pages/Attendance.jsx'
import Reports from './pages/Reports.jsx'
import './styles.css'

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('master_admin_token')
  return token ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/sales/dashboard" replace />} />
          <Route path="sales/dashboard" element={<Dashboard />} />
          <Route path="sales/clients" element={<Clients />} />
          <Route path="sales/clients/:clientId" element={<ClientDetail />} />
          <Route path="sales/employees" element={<Employees />} />
          <Route path="sales/work-tracker" element={<WorkTracker />} />
          <Route path="sales/invoices" element={<Invoices />} />
          <Route path="sales/attendance" element={<Attendance />} />
          <Route path="sales/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
