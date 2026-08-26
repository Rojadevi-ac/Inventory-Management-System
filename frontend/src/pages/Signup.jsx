import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  MdInventory, MdEmail, MdLock, MdPerson, MdVisibility,
  MdVisibilityOff, MdBadge, MdLightMode, MdDarkMode
} from 'react-icons/md'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../hooks/useTheme'
import LanguageSelector from '../components/LanguageSelector'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    avatar_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.warning('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.register(form)
      login(res.data.token, res.data.user)
      toast.success(`Account created! Welcome, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
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

      {/* Background glowing blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-3">
            <MdInventory size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t('createAccount', 'Create Account')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Join IMS Inventory Management System
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8 shadow-xl dark:shadow-none relative">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner module="signup" size="lg" text={t('creatingAccount', 'Creating your account…')} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="form-label text-xs font-semibold">{t('fullName', 'Full Name')}</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="form-label text-xs font-semibold">{t('email', 'Email Address')}</label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
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
                    id="signup-password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 6 characters"
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

              {/* Role Selection */}
              <div>
                <label className="form-label text-xs font-semibold">{t('role', 'Role')}</label>
                <div className="relative">
                  <MdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <select
                    id="signup-role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="select-field pl-10 text-sm"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-3 text-sm py-2.5 shadow-lg shadow-indigo-500/25"
              >
                {t('signUp', 'Sign Up')}
              </button>
            </form>
          )}

          {/* Navigation to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-center">
            <Link
              to="/login"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {t('alreadyHaveAccount', 'Already have an account? Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
