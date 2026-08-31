import { useState, useEffect } from 'react'
import {
  MdPublic, MdAccessTime, MdCalendarToday, MdSchedule,
  MdSave, MdRefresh, MdShield, MdTune, MdSearch
} from 'react-icons/md'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { useTimezone } from '../context/TimezoneContext'
import { useLanguage } from '../context/LanguageContext'

export default function Settings() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const {
    timezone,
    utcOffset,
    timezoneLabel,
    supportedTimezones,
    manualDatetime,
    loading: loadingContext,
    updateTimezoneConfig,
    refreshTimezone,
  } = useTimezone()

  const [selectedTz, setSelectedTz] = useState(timezone)
  const [customDateTime, setCustomDateTime] = useState(manualDatetime || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [liveClock, setLiveClock] = useState({ date: '—', time: '—' })

  // Keep local state in sync when context loads
  useEffect(() => {
    if (timezone) setSelectedTz(timezone)
    if (manualDatetime) setCustomDateTime(manualDatetime)
  }, [timezone, manualDatetime])

  // Real-time ticking clock in configured selected timezone
  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-IN', {
          timeZone: selectedTz,
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        const timeStr = now.toLocaleTimeString('en-IN', {
          timeZone: selectedTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        setLiveClock({ date: dateStr, time: timeStr })
      } catch {
        setLiveClock({ date: '—', time: '—' })
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [selectedTz])

  // Filter supported timezones by search term
  const filteredTimezones = supportedTimezones.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.iana.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSave = async (e) => {
    e.preventDefault()
    if (user?.role !== 'admin') {
      toast.error('Forbidden: Only Administrators can modify global timezone settings.')
      return
    }

    setSaving(true)
    try {
      await updateTimezoneConfig(selectedTz, customDateTime || null)
      toast.success('Global timezone & time configuration saved successfully!')
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update timezone settings'
      toast.error(errMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleResetManualTime = async () => {
    setCustomDateTime('')
    if (user?.role === 'admin') {
      setSaving(true)
      try {
        await updateTimezoneConfig(selectedTz, null)
        toast.info('Reset application time to live server time')
      } catch {
        // ignore
      } finally {
        setSaving(false)
      }
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Layout title={t('settings', 'Admin Settings & Timezone')}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Title Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <MdPublic size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Time & Timezone Settings</h1>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Global Configuration
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Configure application-wide time zone and system clock. Settings apply automatically across all modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={refreshTimezone}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <MdRefresh size={16} /> Refresh
            </button>
          </div>
        </div>

        {loadingContext ? (
          <div className="glass-card p-12 rounded-3xl flex justify-center">
            <LoadingSpinner size="lg" text="Loading timezone configuration..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Timezone Form Controls */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                    <MdPublic className="text-indigo-500" size={18} />
                    <span>Timezone Selection</span>
                  </div>
                  {!isAdmin && (
                    <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <MdShield size={14} /> Read Only (Admin Required)
                    </span>
                  )}
                </div>

                {/* Searchable Dropdown Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Search IANA Timezones
                  </label>
                  <div className="relative">
                    <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Filter by country, city or code (e.g. Kolkata, London, New_York)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field text-xs pl-10 pr-4 py-2.5"
                    />
                  </div>
                </div>

                {/* Select Dropdown */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Application Global Timezone <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedTz}
                    disabled={!isAdmin}
                    onChange={(e) => setSelectedTz(e.target.value)}
                    className="select-field text-xs py-3 px-3 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 w-full"
                  >
                    {filteredTimezones.length > 0 ? (
                      filteredTimezones.map((tz) => (
                        <option key={tz.iana} value={tz.iana}>
                          {tz.label}
                        </option>
                      ))
                    ) : (
                      <option value={selectedTz}>{selectedTz}</option>
                    )}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Selected: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedTz}</span>
                  </p>
                </div>

                {/* Optional Manual Date/Time Configuration */}
                <div className="border-t border-slate-200 dark:border-white/10 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                      <MdTune className="text-purple-500" size={16} />
                      <span>Manual Application Date/Time (Optional Override)</span>
                    </div>
                    {customDateTime && (
                      <button
                        type="button"
                        onClick={handleResetManualTime}
                        className="text-[11px] text-rose-500 hover:underline font-semibold"
                      >
                        Clear Override
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="datetime-local"
                      disabled={!isAdmin}
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="input-field text-xs py-2.5 px-3"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave empty to use live server hardware time automatically.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                {isAdmin && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                    >
                      <MdSave size={18} /> {saving ? 'Saving Settings...' : 'Save Configuration'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Right Col: Live Auto-Updating Clock & Active Info */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-5 bg-slate-900 text-white shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MdAccessTime size={16} className="text-indigo-400" /> Live Clock Indicator
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Live Clock Active" />
                </div>

                <div className="space-y-4">
                  {/* Current Time Display */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Current Live Time
                    </p>
                    <p className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                      {liveClock.time}
                    </p>
                  </div>

                  {/* Current Date Display */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Current Date
                    </p>
                    <p className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
                      <MdCalendarToday size={18} className="text-indigo-400" /> {liveClock.date}
                    </p>
                  </div>

                  {/* Configured Details */}
                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Selected Timezone:</span>
                      <span className="font-semibold text-indigo-300 truncate max-w-[160px]" title={timezone}>
                        {timezone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-slate-400">UTC Offset:</span>
                      <span className="font-mono font-bold text-amber-400">{utcOffset}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400">Display Format:</span>
                      <span className="font-semibold text-slate-300">12-Hour (DD MMM YYYY, hh:mm AM/PM)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <MdShield size={16} /> Automatic Synchronization
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Changing the global timezone updates date display across Dashboard, Products, Purchases, Orders, Inventory, Supplier Issues, and Audit Logs seamlessly without altering historical database records.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
