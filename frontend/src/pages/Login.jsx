import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MdInventory, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLightMode, MdDarkMode, MdRemoveRedEye } from 'react-icons/md'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../hooks/useTheme'
import LanguageSelector from '../components/LanguageSelector'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) {
      toast.warning('Please enter both email address and password')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.login({
        email: form.email.trim(),
        password: form.password.trim(),
      })
      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user)
        toast.success(`Welcome back, ${res.data.user.name}!`)
        navigate('/dashboard')
      } else {
        toast.error('Invalid server response')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errMsg = err.response?.data?.error || err.message || 'Login failed. Please check backend connection.'
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const fillCredential = (email, password) => {
    setForm({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 px-4 py-8 transition-colors duration-200 relative">
      {/* Top Controls: Language Selector & Theme Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <LanguageSelector variant="auth" />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-indigo-500 shadow-sm transition-all"
          title="Toggle Dark / Light Theme"
        >
          {isDark ? <MdLightMode size={18} className="text-amber-400" /> : <MdDarkMode size={18} />}
        </button>
      </div>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in space-y-4">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-3">
            <MdInventory size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t('welcomeBack', 'Welcome Back')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            {t('signIn', 'Sign in to your IMS account')}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 shadow-xl dark:shadow-none relative space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="form-label text-xs font-semibold">{t('email', 'Email Address')}</label>
              <div className="relative">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="imsuser@ims.com"
                  required
                  disabled={loading}
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label text-xs font-semibold">{t('password', 'Password')}</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="input-field pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button with embedded inline loading spinner */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-3 text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>{t('signIn', 'Sign In')}</span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Card — Viewer Only */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Viewer Access
            </p>
            <div>
              <button
                type="button"
                onClick={() => fillCredential('imsuser@ims.com', 'qwerty123')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <MdRemoveRedEye size={16} /> Email: imsuser@ims.com
                </div>
                <div className="text-xs opacity-90 font-mono">
                  qwerty123
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
