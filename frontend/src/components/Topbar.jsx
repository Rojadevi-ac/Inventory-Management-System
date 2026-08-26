import { MdMenu, MdLogout, MdLightMode, MdDarkMode } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTheme } from '../hooks/useTheme'
import { useLanguage } from '../context/LanguageContext'
import Avatar from './Avatar'
import LanguageSelector from './LanguageSelector'

export default function Topbar({ onMenuClick, title }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const userRaw = localStorage.getItem('ims_user')
  const user = userRaw ? JSON.parse(userRaw) : null

  function handleLogout() {
    localStorage.removeItem('ims_token')
    localStorage.removeItem('ims_user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Open navigation menu"
        >
          <MdMenu size={22} />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">{title}</h1>
      </div>

      {/* Right: Language Selector + Theme Toggle + User + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 15-Language Selector Dropdown */}
        <LanguageSelector />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <MdLightMode size={18} className="text-amber-400 animate-fade-in" />
          ) : (
            <MdDarkMode size={18} className="text-indigo-600 animate-fade-in" />
          )}
        </button>

        {/* User pill with WhatsApp-style avatar DP */}
        {user && (
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5">
            <Avatar src={user.avatar_url} name={user.name} size="sm" rounded="rounded-lg" />
            <div className="leading-none text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize mt-0.5">{user.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={t('logout', 'Sign Out')}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 transition-all duration-200 text-xs sm:text-sm font-medium"
        >
          <MdLogout size={17} />
          <span className="hidden md:inline">{t('logout', 'Sign Out')}</span>
        </button>
      </div>
    </header>
  )
}
