import { useState } from 'react'
import {
  MdClose, MdCheckCircle, MdWarning, MdErrorOutline, MdContentCopy,
  MdCheck, MdEdit, MdCategory, MdQrCode, MdLocalShipping, MdVerified,
  MdStar, MdStarHalf, MdCalendarToday, MdLayers, MdNotificationsActive
} from 'react-icons/md'
import Avatar from './Avatar'
import { formatDateTime, formatDate } from '../utils/formatDate'

/**
 * E-Commerce (Amazon-style) Product Details Showcase Card Pop-up Modal
 * Centers on screen with blurred backdrop and comprehensive product details.
 */
export default function ProductDetailModal({
  product,
  onClose,
  onEdit,
  canModify = false,
}) {
  const [copiedSku, setCopiedSku] = useState(false)
  const [copiedBarcode, setCopiedBarcode] = useState(false)

  if (!product) return null

  function copyToClipboard(text, isBarcode = false) {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (isBarcode) {
      setCopiedBarcode(true)
      setTimeout(() => setCopiedBarcode(false), 2000)
    } else {
      setCopiedSku(true)
      setTimeout(() => setCopiedSku(false), 2000)
    }
  }

  const stockQty = product.quantity ?? 0
  const reorderLevel = product.reorder_level ?? 10
  const isOutOfStock = stockQty <= 0
  const isLowStock = stockQty > 0 && stockQty <= reorderLevel
  const isArchived = product.status === 'inactive'

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl animate-slide-in max-h-[92vh] flex flex-col bg-white dark:bg-dark-900 ring-1 ring-black/10"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-dark-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20">
              {product.category || 'General Product'}
            </span>
            <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Close (Esc)"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* E-Commerce 2-Column Content Showcase */}
        <div className="overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Product Image Gallery & Trust Badges ────────── */}
          <div className="md:col-span-5 flex flex-col items-center gap-3">
            <div className="relative w-full aspect-square max-w-[300px] rounded-3xl overflow-hidden bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center group/img">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover/img:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Avatar
                    name={product.name}
                    size="2xl"
                    rounded="rounded-2xl"
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {isArchived ? (
                  <span className="badge-amber font-semibold shadow-sm text-xs py-1 px-2.5">
                    Archived
                  </span>
                ) : isOutOfStock ? (
                  <span className="badge-red font-semibold shadow-sm text-xs py-1 px-2.5">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="badge-amber font-semibold shadow-sm text-xs py-1 px-2.5 flex items-center gap-1">
                    <MdWarning size={13} /> Low Stock
                  </span>
                ) : (
                  <span className="badge-green font-semibold shadow-sm text-xs py-1 px-2.5 flex items-center gap-1">
                    <MdCheckCircle size={13} /> In Stock
                  </span>
                )}
              </div>

              {/* Pack Size Badge on Image */}
              {product.size && (
                <div className="absolute bottom-3 right-3 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm">
                  {product.size}
                </div>
              )}
            </div>

            {/* E-Commerce Trust Badges */}
            <div className="w-full max-w-[300px] space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20">
                <MdVerified size={16} className="text-emerald-500 flex-shrink-0" />
                <span>100% Quality Inspected Item</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-500/20">
                <MdLocalShipping size={16} className="text-indigo-500 flex-shrink-0" />
                <span>Live Inventory Sync & Traceable</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: E-Commerce Product Details & Specs ─────────── */}
          <div className="md:col-span-7 space-y-4">
            {/* Title & Ratings */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  <MdStar size={16} />
                  <MdStar size={16} />
                  <MdStar size={16} />
                  <MdStar size={16} />
                  <MdStarHalf size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.8</span>
                <span className="text-xs text-slate-400">• Verified IMS Catalog</span>
              </div>
            </div>

            {/* Amazon-style Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:bg-dark-800 border border-indigo-100 dark:border-white/10 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-500 font-medium">Price:</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{Number(product.price ?? 0).toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">(Inclusive of all taxes)</span>
              </div>

              {/* Stock Availability Text */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                {isArchived ? (
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                    Product is archived and stored for future reference.
                  </p>
                ) : isOutOfStock ? (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
                    <MdErrorOutline size={16} /> Currently Out of Stock.
                  </p>
                ) : isLowStock ? (
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                    <MdWarning size={16} /> Only {stockQty} left in stock — reorder threshold is {reorderLevel} units.
                  </p>
                ) : (
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <MdCheckCircle size={16} /> In Stock ({stockQty} units available on hand).
                  </p>
                )}
              </div>
            </div>

            {/* Product Specifications Sheet */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Product Specifications
              </h3>
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {/* SKU */}
                <div className="grid grid-cols-3 p-3 bg-slate-50/70 dark:bg-dark-800/50">
                  <span className="text-slate-500 font-medium">SKU Code</span>
                  <span className="col-span-2 font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{product.sku}</span>
                    <button
                      onClick={() => copyToClipboard(product.sku)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Copy SKU"
                    >
                      {copiedSku ? <MdCheck size={14} className="text-emerald-500" /> : <MdContentCopy size={14} />}
                    </button>
                  </span>
                </div>

                {/* Quantity / Pack Size */}
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Quantity / Pack</span>
                  <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                    {product.size}
                  </span>
                </div>

                {/* Barcode / UPC */}
                <div className="grid grid-cols-3 p-3 bg-slate-50/70 dark:bg-dark-800/50">
                  <span className="text-slate-500 font-medium">Barcode / UPC</span>
                  <span className="col-span-2 font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{product.barcode || '— Not assigned —'}</span>
                    {product.barcode && (
                      <button
                        onClick={() => copyToClipboard(product.barcode, true)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copy Barcode"
                      >
                        {copiedBarcode ? <MdCheck size={14} className="text-emerald-500" /> : <MdContentCopy size={14} />}
                      </button>
                    )}
                  </span>
                </div>

                {/* Reorder Level */}
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Reorder Alert</span>
                  <span className="col-span-2 font-semibold text-slate-700 dark:text-slate-300">
                    {reorderLevel} units
                  </span>
                </div>

                {/* Created Date */}
                {product.created_at && (
                  <div className="grid grid-cols-3 p-3 bg-slate-50/70 dark:bg-dark-800/50">
                    <span className="text-slate-500 font-medium">Catalog Date</span>
                    <span className="col-span-2 text-slate-600 dark:text-slate-400">
                      {formatDateTime(product.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-dark-800/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-5"
          >
            Close
          </button>

          {canModify && onEdit && (
            <button
              onClick={() => { onClose(); onEdit(product) }}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5"
            >
              <MdEdit size={16} /> Edit Product Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
