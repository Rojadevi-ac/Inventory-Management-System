import { NavLink } from 'react-router-dom'
import {
  MdDashboard, MdInventory, MdCategory, MdStore, MdAddShoppingCart,
  MdShoppingCart, MdLocalShipping, MdPeople, MdArchive, MdClose,
  MdChevronLeft, MdChevronRight, MdReportProblem, MdPublic
} from 'react-icons/md'
import FlaticonAnimatedIcon from './FlaticonAnimatedIcon'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

const baseNavItems = [
  { to: '/dashboard',         key: 'dashboard',         fallback: 'Dashboard',             Icon: MdDashboard,       module: 'dashboard' },
  { to: '/products',          key: 'products',          fallback: 'Products',              Icon: MdInventory,       module: 'products' },
  { to: '/categories',        key: 'categories',        fallback: 'Categories',            Icon: MdCategory,        module: 'categories' },
  { to: '/inventory',         key: 'inventory',         fallback: 'Inventory',             Icon: MdStore,           module: 'inventory' },
  { to: '/purchases',         key: 'purchases',         fallback: 'Purchases',              Icon: MdAddShoppingCart, module: 'purchases' },
  { to: '/orders',            key: 'orders',            fallback: 'Orders',                Icon: MdShoppingCart,    module: 'orders' },
  { to: '/supplier-issues',   key: 'supplierIssues',    fallback: 'Damages & Issues',      Icon: MdReportProblem,   module: 'damages' },
  { to: '/suppliers',         key: 'suppliers',         fallback: 'Suppliers',             Icon: MdLocalShipping,   module: 'suppliers' },
  { to: '/archived-products', key: 'archivedProducts',  fallback: 'Archived Products',     Icon: MdArchive,         module: 'archived' },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const role = user?.role

  const navItems = [
    ...baseNavItems,
    // Staff & Admin Settings management: visible to admin and manager
    ...(role === 'admin' || role === 'manager'
      ? [
          { to: '/staff', key: 'staff', fallback: 'Staff', Icon: MdPeople, module: 'staff' },
          { to: '/settings', key: 'settings', fallback: 'Time & Timezone', Icon: MdPublic, module: 'settings' },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 lg:z-40
          bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-white/5
          flex flex-col
          transition-all duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          ${collapsed ? 'lg:w-20 overflow-visible' : 'lg:w-64 overflow-hidden'}
          w-64
        `}
      >
        {/* Logo & Collapse button */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-5'} py-4 border-b border-slate-200 dark:border-white/5 h-16`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MdInventory className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div className="whitespace-nowrap transition-opacity duration-200">
                <p className="font-bold text-slate-800 dark:text-white text-sm leading-none">IMS</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Inventory System</p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Role badge */}
        {role && !collapsed && (
          <div className="px-4 pt-3 transition-opacity duration-200">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase
              ${role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' : ''}
              ${role === 'manager' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' : ''}
              ${role === 'staff' ? 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30' : ''}
              ${role === 'viewer' ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-bold' : ''}
            `}>
              {role === 'viewer' ? 'Read-Only Viewer' : role}
            </span>
          </div>
        )}

        {/* Nav links */}
        <nav className={`flex-1 px-3 py-4 space-y-1.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {navItems.map(({ to, key, fallback, module }) => {
            const label = t(key, fallback)
            return (
              <div key={to} className="relative group/nav">
                <NavLink
                  to={to}
                  onClick={onClose}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/20 dark:to-purple-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <FlaticonAnimatedIcon
                        module={module}
                        size={22}
                        className={`flex-shrink-0 ${isActive ? 'scale-110' : 'opacity-80 group-hover/nav:opacity-100'} transition-transform duration-200`}
                      />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </>
                  )}
                </NavLink>

                {/* Floating Tooltip in Collapsed Mode — Always Visible on Top */}
                {collapsed && (
                  <div className="hidden lg:group-hover/nav:flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl z-[99999] whitespace-nowrap pointer-events-none border border-slate-700/80">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-[5px] border-transparent border-r-slate-900" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-3 border-t border-slate-200 dark:border-white/5 ${collapsed ? 'text-center' : ''}`}>
          <p className="text-[11px] text-slate-400 dark:text-slate-600 truncate">
            {collapsed ? 'v3' : 'IMS v3.0 © 2026'}
          </p>
        </div>
      </aside>
    </>
  )
}
