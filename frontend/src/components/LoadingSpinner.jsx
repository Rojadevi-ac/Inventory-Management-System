import FlaticonAnimatedIcon from './FlaticonAnimatedIcon'

/**
 * Clean module-specific loader displaying crisp Flaticon vector animated icons
 * with localized progress text and zero distracting extra blur effects.
 */
export default function LoadingSpinner({
  size = 'md',
  text = '',
  module = 'default',
  fullscreen = false,
}) {
  const moduleTexts = {
    dashboard: 'Loading dashboard analytics…',
    products: 'Loading product catalog…',
    inventory: 'Syncing live stock inventory…',
    purchases: 'Loading inbound purchases…',
    orders: 'Loading customer orders…',
    damages: 'Loading damage & supplier records…',
    supplierIssues: 'Loading damage & supplier records…',
    suppliers: 'Loading supplier directory…',
    categories: 'Loading categories…',
    staff: 'Loading staff members…',
    archived: 'Loading archived catalog…',
    auth: 'Authenticating…',
    default: 'Loading data…',
  }

  const displayText = text || moduleTexts[module] || moduleTexts.default
  const sizePx = size === 'lg' ? 60 : size === 'sm' ? 32 : 44

  const content = (
    <div className="flex flex-col items-center justify-center p-6 animate-fade-in select-none">
      {/* Clean Flaticon Animated Vector Icon */}
      <div className="flex items-center justify-center p-2">
        <FlaticonAnimatedIcon module={module} size={sizePx} />
      </div>

      {/* Localized Loading Text */}
      {displayText && (
        <div className="mt-3 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
            {displayText}
          </p>
        </div>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-md">
        {content}
      </div>
    )
  }

  return content
}
