export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-indigo-500/30 border-t-indigo-500 animate-spin`}
      />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  )
}
