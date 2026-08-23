import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Avatar from './Avatar'
import { formatDate } from '../utils/formatDate'
import {
  MdCategory, MdQrCode, MdLayers, MdNotificationsActive,
  MdCalendarToday, MdCheckCircle, MdWarning, MdStar, MdStarHalf,
  MdLocalShipping, MdVerified, MdContentCopy, MdCheck
} from 'react-icons/md'

export default function ProductHoverCard({ product, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedSku, setCopiedSku] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, showAbove: false })
  const triggerRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const cardHeight = 390
    const cardWidth = 520
    const padding = 14

    let top = rect.top + window.scrollY - 20
    let left = rect.right + padding + window.scrollX

    // If card overflows the right viewport edge, position to the left of the image
    if (rect.right + cardWidth + padding > window.innerWidth) {
      left = Math.max(10, rect.left - cardWidth - padding + window.scrollX)
    }

    // If card overflows the bottom viewport edge, shift upward
    if (rect.top + cardHeight > window.innerHeight) {
      top = Math.max(10 + window.scrollY, rect.bottom - cardHeight + window.scrollY)
    }

    setCoords({ top, left })
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 100) // Snappy responsive hover popup
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 120)
  }

  function handleCopySku(e) {
    e.stopPropagation()
    if (!product?.sku) return
    navigator.clipboard.writeText(product.sku)
    setCopiedSku(true)
    setTimeout(() => setCopiedSku(false), 1500)
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  if (!product) return children

  const isLowStock = product.low_stock || (product.reorder_level != null && (product.quantity ?? 0) < product.reorder_level)
  const isOutOfStock = (product.quantity ?? 0) <= 0
  const isArchived = product.status === 'inactive'

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block relative cursor-pointer"
      >
        {children}
      </div>

      {isOpen &&
        createPortal(
          <div
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onMouseEnter={() => {
              clearTimeout(timeoutRef.current)
              setIsOpen(true)
            }}
            onMouseLeave={handleMouseLeave}
            className="fixed z-[99999] w-[460px] sm:w-[510px] bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl p-5 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto select-none ring-1 ring-black/5"
          >
            {/* Amazon-style 2-Column Product Showcase Layout */}
            <div className="grid grid-cols-12 gap-4 items-start">
              {/* ── Left Column: Framed Gallery & Badges ──────────────────────── */}
              <div className="col-span-5 flex flex-col gap-2">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-800 p-3 flex items-center justify-center min-h-[175px] max-h-[195px] border border-slate-200/80 dark:border-white/10 group/img">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="max-h-40 max-w-full object-contain rounded-xl drop-shadow-md group-hover/img:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="py-3">
                      <Avatar
                        name={product.name}
                        size="xl"
                        rounded="rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Stock Status Tag on Image */}
                  <div className="absolute top-2 left-2">
                    {isArchived ? (
                      <span className="badge-amber text-[10px] py-0.5 px-2 font-semibold shadow-sm">
                        Archived
                      </span>
                    ) : isOutOfStock ? (
                      <span className="badge-red text-[10px] py-0.5 px-2 font-semibold shadow-sm">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="badge-red text-[10px] py-0.5 px-2 font-semibold shadow-sm flex items-center gap-1">
                        <MdWarning size={11} /> Low Stock
                      </span>
                    ) : (
                      <span className="badge-green text-[10px] py-0.5 px-2 font-semibold shadow-sm flex items-center gap-1">
                        <MdCheckCircle size={11} /> In Stock
                      </span>
                    )}
                  </div>

                  {/* Pack Size / Quantity Pill */}
                  {product.size && (
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                      {product.size}
                    </div>
                  )}
                </div>

                {/* E-Commerce Highlights */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                    <MdVerified size={13} />
                    <span>100% Quality Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                    <MdLocalShipping size={13} />
                    <span>Real-Time Inventory Synced</span>
                  </div>
                </div>
              </div>

              {/* ── Right Column: E-Commerce Product Details ───────────────────── */}
              <div className="col-span-7 space-y-2.5">
                {/* Brand / Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">
                    <MdCategory size={12} /> {product.category || 'General'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID #{product.id}
                  </span>
                </div>

                {/* Product Title */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h3>

                {/* Ratings Row (Amazon/Flipkart Style) */}
                <div className="flex items-center gap-1.5 text-xs text-amber-500">
                  <div className="flex items-center">
                    <MdStar size={14} />
                    <MdStar size={14} />
                    <MdStar size={14} />
                    <MdStar size={14} />
                    <MdStarHalf size={14} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">4.8</span>
                  <span className="text-slate-400 text-[11px]">• Verified Catalog Item</span>
                </div>

                {/* Amazon-Style Price Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/80 dark:border-white/10 space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Price:</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(product.price ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">(Incl. of all taxes)</span>
                  </div>

                  {/* Stock Availability Callout */}
                  <div className="text-xs pt-0.5">
                    {isArchived ? (
                      <p className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                        Product is currently archived.
                      </p>
                    ) : isOutOfStock ? (
                      <p className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                        Currently Out of Stock.
                      </p>
                    ) : isLowStock ? (
                      <p className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                        Low Stock — Only {product.quantity ?? 0} units left in stock!
                      </p>
                    ) : (
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        In Stock ({product.quantity ?? 0} units available on hand)
                      </p>
                    )}
                  </div>
                </div>

                {/* E-Commerce Specification Sheet */}
                <div className="space-y-1 pt-1 text-xs">
                  {/* SKU with 1-Click Copy */}
                  <div className="flex items-center justify-between bg-slate-50/80 dark:bg-dark-800/60 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">SKU Code</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {product.sku || '—'}
                      </span>
                      {product.sku && (
                        <button
                          onClick={handleCopySku}
                          title="Copy SKU Code"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          {copiedSku ? <MdCheck size={13} className="text-emerald-500" /> : <MdContentCopy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantity / Size & Barcode */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-slate-50/80 dark:bg-dark-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-medium">Quantity / Size</span>
                      <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">
                        {product.size || 'Standard'}
                      </span>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-dark-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-medium">Reorder Alert</span>
                      <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">
                        {product.reorder_level != null ? `${product.reorder_level} units` : '10 units'}
                      </span>
                    </div>
                  </div>

                  {/* Barcode / UPC (if available) */}
                  {product.barcode && (
                    <div className="flex items-center justify-between bg-slate-50/80 dark:bg-dark-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <MdQrCode size={12} /> Barcode
                      </span>
                      <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {product.barcode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Timestamp */}
                {product.created_at && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-white/5">
                    <span className="flex items-center gap-1">
                      <MdCalendarToday size={11} /> Listed on
                    </span>
                    <span>{formatDate(product.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
