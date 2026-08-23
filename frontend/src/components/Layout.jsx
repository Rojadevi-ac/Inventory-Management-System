import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('ims_sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('ims_sidebar_collapsed', collapsed ? 'true' : 'false')
  }, [collapsed])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 focus:outline-none">
          <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
