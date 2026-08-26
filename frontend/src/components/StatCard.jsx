import { useNavigate } from 'react-router-dom'
import FlaticonAnimatedIcon from './FlaticonAnimatedIcon'

export default function StatCard({ title, value, subtitle, icon: Icon, module, color = 'indigo', onClick, to }) {
  const navigate = useNavigate()
  const colorMap = {
    indigo:  { bg: 'from-indigo-600/20 to-purple-600/20', icon: 'bg-indigo-600/30 text-indigo-400', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    emerald: { bg: 'from-emerald-600/20 to-teal-600/20',  icon: 'bg-emerald-600/30 text-emerald-400', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    amber:   { bg: 'from-amber-600/20 to-orange-600/20',  icon: 'bg-amber-600/30 text-amber-400',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
    rose:    { bg: 'from-rose-600/20 to-red-600/20',      icon: 'bg-rose-600/30 text-rose-400',     border: 'border-rose-500/20',    text: 'text-rose-400'    },
  }
  const c = colorMap[color] || colorMap.indigo

  function handleClick() {
    if (onClick) onClick()
    else if (to) navigate(to)
  }

  const isClickable = Boolean(onClick || to)

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => isClickable && e.key === 'Enter' && handleClick()}
      className={`glass-card bg-gradient-to-br ${c.bg} border ${c.border} p-6 relative overflow-hidden group transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-100' : ''
      }`}
    >
      {/* Glow blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.icon} opacity-20 blur-2xl group-hover:opacity-35 transition-opacity`} />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            {title}
            {isClickable && (
              <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                → View
              </span>
            )}
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {value?.toLocaleString() ?? '—'}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1.5 font-medium ${c.text}`}>{subtitle}</p>
          )}
        </div>
        {module ? (
          <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-2 flex items-center justify-center flex-shrink-0 shadow-lg border border-slate-200/60 dark:border-white/10 group-hover:scale-110 transition-transform">
            <FlaticonAnimatedIcon module={module} size={36} />
          </div>
        ) : Icon ? (
          <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon size={24} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
