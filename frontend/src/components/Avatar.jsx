import { useState } from 'react'

const COLOR_PALETTE = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-rose-600',
  'bg-pink-600',
  'bg-amber-600',
]

function getAvatarColor(name) {
  if (!name) return 'bg-indigo-600'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length
  return COLOR_PALETTE[index]
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-16 h-16 text-xl font-bold',
  '2xl': 'w-20 h-20 text-2xl font-bold',
}

export default function Avatar({ src, name, size = 'sm', className = '', rounded = 'rounded-full' }) {
  const [imgError, setImgError] = useState(false)
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase()
  const bgColor = getAvatarColor(name)
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClass} ${rounded} object-cover flex-shrink-0 shadow-sm border border-slate-200 dark:border-white/10 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${rounded} ${bgColor} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm select-none uppercase tracking-wider ${className}`}
      title={name}
    >
      {initial}
    </div>
  )
}
