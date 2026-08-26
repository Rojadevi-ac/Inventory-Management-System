/**
 * Flaticon Animated Icons matching the exact requested Flaticon URLs:
 * 1. Suppliers (Logistics Assistant 16272894)
 * 2. Products (Shopping Cart 19020213)
 * 3. Orders (Delivery Service 18485014)
 * 4. Inventory (Clipboard Audit 15309712)
 * 5. Purchases (Select / Purchase Click 18873803)
 * 6. Categories (List 8722658)
 * 7. Archived Products (Archive List 8722658)
 * 8. Damaged Product (Damaged Box 18485006)
 * 9. Staffs (Team 18821835)
 * 10. Dashboard (Dashboard Gauge 15578463)
 */
export default function FlaticonAnimatedIcon({
  module = 'dashboard',
  size = 48,
  className = '',
}) {
  const width = size
  const height = size

  switch (module) {
    case 'dashboard':
      // 📊 Dashboard Gauge (Flaticon 15578463)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Outer Gauge Ring */}
            <path d="M12 44C8 38 8 28 14 20C20 12 32 8 42 12C50 16 56 26 54 36C52 42 46 48 40 50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 44C16 48 22 52 30 52" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

            {/* Dashboard Speedometer Needle Sweeping */}
            <g className="animate-spin origin-[32px_36px]" style={{ animationDuration: '4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <path d="M32 36L44 20" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="32" cy="36" r="5" fill="#4f46e5" />
            </g>

            {/* Rising Chart Bars at Bottom */}
            <rect x="18" y="38" width="5" height="10" rx="1.5" fill="#818cf8" className="animate-pulse" />
            <rect x="26" y="32" width="5" height="16" rx="1.5" fill="#a855f7" className="animate-pulse" style={{ animationDelay: '200ms' }} />
            <rect x="34" y="26" width="5" height="22" rx="1.5" fill="#f43f5e" className="animate-pulse" style={{ animationDelay: '400ms' }} />
          </svg>
        </div>
      )

    case 'products':
      // 🛒 Products Shopping Cart (Flaticon 19020213)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Shopping Cart Wire Frame */}
            <path d="M8 16H16L22 42H50L56 22H20" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 28H54" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" />

            {/* Product Item Dropping into Cart */}
            <rect x="28" y="10" width="14" height="14" rx="3" fill="#60a5fa" className="animate-bounce" />
            <path d="M35 10V24" stroke="#ffffff" strokeWidth="2" />

            {/* Spinning Wheels */}
            <circle cx="26" cy="50" r="4.5" fill="#1d4ed8" className="animate-ping" opacity="0.3" />
            <circle cx="26" cy="50" r="4" fill="#1e3a8a" />
            <circle cx="48" cy="50" r="4" fill="#1e3a8a" />
          </svg>
        </div>
      )

    case 'orders':
      // 🛵 Orders Delivery Service / Express Courier (Flaticon 18485014)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Express Delivery Box Body */}
            <rect x="10" y="22" width="28" height="22" rx="3" fill="#f59e0b" />
            <path d="M10 30H38" stroke="#d97706" strokeWidth="2" />

            {/* Courier Helmet / Scooter Cabin */}
            <path d="M38 28H48L54 36V44H38V28Z" fill="#fbbf24" />
            <circle cx="48" cy="34" r="3" fill="#ffffff" />

            {/* Motion Lines behind Scooter */}
            <path d="M4 26H8M2 34H6M4 42H8" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />

            {/* Rolling Wheels */}
            <circle cx="20" cy="46" r="5" fill="#78350f" className="animate-pulse" />
            <circle cx="46" cy="46" r="5" fill="#78350f" className="animate-pulse" />
          </svg>
        </div>
      )

    case 'inventory':
      // 📋 Inventory Clipboard Audit (Flaticon 15309712)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Clipboard Base */}
            <rect x="14" y="14" width="36" height="44" rx="4" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="3" />
            {/* Top Metallic Clip */}
            <rect x="24" y="10" width="16" height="7" rx="2" fill="#059669" />
            <circle cx="32" cy="13" r="1.5" fill="#ffffff" />

            {/* Animated Checkmarks & Lines */}
            <path d="M20 26L24 30L30 22" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
            <line x1="34" y1="26" x2="44" y2="26" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M20 38L24 42L30 34" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDelay: '300ms' }} />
            <line x1="34" y1="38" x2="44" y2="38" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />

            <line x1="20" y1="48" x2="44" y2="48" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )

    case 'purchases':
      // 👆 Purchases Select / Click Purchase (Flaticon 18873803)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Purchase Item Selection Box */}
            <rect x="12" y="14" width="40" height="34" rx="4" fill="#a855f7" opacity="0.2" stroke="#a855f7" strokeWidth="3" />
            {/* Selected Checkmark Circle */}
            <circle cx="32" cy="30" r="10" fill="#9333ea" />
            <path d="M27 30L30 33L37 26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Animated Cursor Arrow Clicking Button */}
            <g className="animate-bounce" style={{ animationDuration: '1.5s' }}>
              <path d="M38 40L48 50L43 51L46 58L42 59L39 52L35 55L38 40Z" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      )

    case 'categories':
      // 📑 Categories List (Flaticon 8722658)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Category List Background */}
            <rect x="12" y="12" width="40" height="44" rx="4" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="3" />

            {/* Animated List Items */}
            <circle cx="20" cy="22" r="3" fill="#8b5cf6" className="animate-ping" opacity="0.5" />
            <circle cx="20" cy="22" r="3" fill="#7c3aed" />
            <line x1="28" y1="22" x2="44" y2="22" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />

            <circle cx="20" cy="34" r="3" fill="#7c3aed" />
            <line x1="28" y1="34" x2="44" y2="34" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />

            <circle cx="20" cy="46" r="3" fill="#7c3aed" />
            <line x1="28" y1="46" x2="40" y2="46" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )

    case 'archived':
      // 📁 Archived Products List & Drawer (Flaticon 8722658)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Metallic Archive Box */}
            <rect x="10" y="14" width="44" height="40" rx="4" fill="#475569" />
            <rect x="16" y="22" width="32" height="10" rx="2" fill="#64748b" />
            <rect x="16" y="38" width="32" height="10" rx="2" fill="#64748b" />

            {/* Sliding Drawer Handle */}
            <rect x="26" y="25" width="12" height="4" rx="1" fill="#94a3b8" className="animate-pulse" />
            <rect x="26" y="41" width="12" height="4" rx="1" fill="#94a3b8" className="animate-pulse" style={{ animationDelay: '300ms' }} />
          </svg>
        </div>
      )

    case 'damages':
    case 'supplierIssues':
      // 📦 Damaged Product Box (Flaticon 18485006)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Damaged Cardboard Box */}
            <path d="M12 26L32 15L52 26V48L32 58L12 48V26Z" fill="#f43f5e" opacity="0.25" stroke="#f43f5e" strokeWidth="3" />

            {/* Cracked / Torn Flap Lines */}
            <path d="M22 20L32 30L42 20" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 30V48" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="3 3" />

            {/* Hazard Warning Flash Badge */}
            <circle cx="48" cy="18" r="7" fill="#ef4444" className="animate-bounce" />
            <path d="M48 14V19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="48" cy="22" r="1" fill="#ffffff" />
          </svg>
        </div>
      )

    case 'staff':
      // 👥 Staffs Team (Flaticon 18821835)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Left Staff Avatar */}
            <circle cx="20" cy="26" r="7" fill="#0d9488" opacity="0.7" />
            <path d="M10 46C10 40 14 36 20 36C26 36 30 40 30 46" fill="#0d9488" opacity="0.7" />

            {/* Right Staff Avatar */}
            <circle cx="44" cy="26" r="7" fill="#0d9488" opacity="0.7" />
            <path d="M34 46C34 40 38 36 44 36C50 36 54 40 54 46" fill="#0d9488" opacity="0.7" />

            {/* Center Leader Staff Avatar */}
            <circle cx="32" cy="22" r="8" fill="#14b8a6" className="animate-pulse" />
            <path d="M20 48C20 41 25 36 32 36C39 36 44 41 44 48" fill="#14b8a6" />

            {/* Connected Badge Star */}
            <circle cx="32" cy="12" r="4" fill="#f59e0b" className="animate-ping" opacity="0.5" />
            <circle cx="32" cy="12" r="3" fill="#f59e0b" />
          </svg>
        </div>
      )

    case 'suppliers':
      // 🚚 Suppliers Logistics Assistant (Flaticon 16272894)
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Logistics Assistant Agent Body */}
            <circle cx="32" cy="20" r="8" fill="#0284c7" />
            {/* Headset */}
            <path d="M22 20C22 14.5 26.5 10 32 10C37.5 10 42 14.5 42 20" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="42" cy="22" r="2.5" fill="#38bdf8" />

            {/* Supplier Package Held in Hand */}
            <rect x="22" y="32" width="20" height="18" rx="2" fill="#06b6d4" className="animate-bounce" />
            <path d="M22 38H42" stroke="#0891b2" strokeWidth="2" />
            <path d="M32 32V50" stroke="#0891b2" strokeWidth="2" />
          </svg>
        </div>
      )

    case 'auth':
    default:
      // 🔐 Security Keylock
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width, height }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <path d="M22 28V20C22 14.5 26.5 10 32 10C37.5 10 42 14.5 42 20V28" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
            <rect x="16" y="28" width="32" height="26" rx="5" fill="#4f46e5" />
            <circle cx="32" cy="38" r="3" fill="#fef08a" className="animate-ping" />
            <path d="M32 40V46" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )
  }
}
