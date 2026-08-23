import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import ArchivedProducts from './pages/ArchivedProducts'
import Inventory from './pages/Inventory'
import Purchases from './pages/Purchases'
import Orders from './pages/Orders'
import Suppliers from './pages/Suppliers'
import SupplierIssues from './pages/SupplierIssues'
import Staff from './pages/Staff'

// Initialize theme on boot
const savedTheme = localStorage.getItem('ims_theme') || 'dark'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — all authenticated users */}
        <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products"          element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/categories"        element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/archived-products" element={<ProtectedRoute><ArchivedProducts /></ProtectedRoute>} />
        <Route path="/inventory"         element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/purchases"         element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/orders"            element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/supplier-issues"   element={<ProtectedRoute><SupplierIssues /></ProtectedRoute>} />
        <Route path="/damages"           element={<Navigate to="/supplier-issues" replace />} />
        <Route path="/suppliers"         element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />

        {/* Admin + Manager only */}
        <Route path="/staff"             element={<ProtectedRoute roles={['admin', 'manager']}><Staff /></ProtectedRoute>} />

        {/* Signup redirect to login */}
        <Route path="/signup"            element={<Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*"                  element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Centered Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  </React.StrictMode>
)
