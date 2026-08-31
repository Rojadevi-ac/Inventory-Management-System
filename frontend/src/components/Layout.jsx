import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { MdRemoveRedEye, MdLock } from 'react-icons/md'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, title }) {
  const { user } = useAuth()
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
        {/* Read-Only Viewer Mode Banner */}
        {user?.role === 'viewer' && (
          <div className="bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 text-cyan-100 border-b border-cyan-500/30 text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md z-30">
            <div className="flex items-center gap-2">
              <MdRemoveRedEye size={18} className="text-cyan-400 animate-pulse" />
              <span>
                <strong className="text-white">Read-Only Viewer Account ({user.name || 'imsuser'}):</strong> Viewing mode active. All add, edit, and delete operations are restricted.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
              <MdLock size={12} /> View Only
            </span>
          </div>
        )}

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
