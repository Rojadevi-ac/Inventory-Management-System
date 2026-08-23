import { useEffect, useState, useCallback } from 'react'
import {
  MdClose, MdHistory, MdFilterList, MdAddShoppingCart, MdShoppingCart,
  MdEdit, MdRefresh, MdShield, MdArrowForward
} from 'react-icons/md'
import Avatar from './Avatar'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'
import { logsAPI, staffAPI } from '../services/api'
import { formatDateTime } from '../utils/formatDate'

const ACTION_CONFIG = {
  PURCHASE: {
    label: 'Stock IN (Purchase)',
    badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    icon: MdAddShoppingCart,
  },
  ORDER: {
    label: 'Stock OUT (Order)',
    badge: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    icon: MdShoppingCart,
  },
  CREATE: {
    label: 'Product Created',
    badge: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    icon: MdEdit,
  },
  UPDATE: {
    label: 'Details Updated',
    badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    icon: MdEdit,
  },
  ARCHIVE: {
    label: 'Archived',
    badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    icon: MdHistory,
  },
  RESTORE: {
    label: 'Restored',
    badge: 'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
    icon: MdRefresh,
  },
  REORDER_UPDATE: {
    label: 'Reorder Level Updated',
    badge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    icon: MdEdit,
  },
}

export default function ProductLogHistoryModal({ product, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [staffList, setStaffList] = useState([])

  const fetchStaff = useCallback(async () => {
    try {
      const res = await staffAPI.list()
      setStaffList(res.data.users || [])
    } catch {
      // ignore
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      let res
      const params = {
        action_type: actionFilter || undefined,
        user_id: staffFilter || undefined,
        per_page: 50,
      }
      if (product?.id) {
        res = await logsAPI.forProduct(product.id, params)
      } else {
        res = await logsAPI.list(params)
      }
      setLogs(res.data.logs || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [product, actionFilter, staffFilter])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl animate-slide-in max-h-[90vh] flex flex-col bg-white dark:bg-dark-900">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-dark-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MdHistory size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                {product ? `Log History: ${product.name}` : 'Staff Activity & Product History Log'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {product ? `SKU: ${product.sku} • Category: ${product.category || '—'}` : 'Track status, purchases, and orders updated by staff members'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Dropdown Filters Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-dark-800/40 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Action Type Dropdown */}
            <div className="relative">
              <select
                id="log-action-filter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="select-field text-xs py-1.5 pl-3 pr-8 rounded-lg bg-white dark:bg-dark-800"
              >
                <option value="">All Action Types</option>
                <option value="PURCHASE">Purchases (Stock IN)</option>
                <option value="ORDER">Orders (Stock OUT)</option>
                <option value="UPDATE">Product Updates</option>
                <option value="CREATE">Product Creation</option>
                <option value="ARCHIVE">Archived</option>
                <option value="RESTORE">Restored</option>
              </select>
            </div>

            {/* Staff Member Dropdown */}
            <div className="relative">
              <select
                id="log-staff-filter"
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="select-field text-xs py-1.5 pl-3 pr-8 rounded-lg bg-white dark:bg-dark-800"
              >
                <option value="">All Staff Members</option>
                {staffList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {(actionFilter || staffFilter) && (
              <button
                onClick={() => { setActionFilter(''); setStaffFilter('') }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {logs.length} record{logs.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Chronological Timeline Log Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" text="Loading log history…" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={MdHistory}
              title="No log history recorded"
              subtitle={actionFilter || staffFilter ? 'No logs match the selected dropdown filters' : 'Activity logs will appear here when purchases, orders, or product updates occur'}
            />
          ) : (
            <div className="space-y-3.5">
              {logs.map((log) => {
                const config = ACTION_CONFIG[log.action_type] || {
                  label: log.action_type,
                  badge: 'bg-slate-100 text-slate-700 border-slate-200',
                  icon: MdHistory,
                }
                const IconComponent = config.icon

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-dark-800/60 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Left: Staff DP + Action Details */}
                    <div className="flex items-start gap-3.5">
                      {/* Staff Avatar with WhatsApp-style DP */}
                      <Avatar
                        src={log.user_avatar}
                        name={log.user_name || 'Staff'}
                        size="md"
                        rounded="rounded-full"
                      />

                      <div className="space-y-1">
                        {/* Staff Name & Role */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {log.user_name || 'System / Direct'}
                          </span>
                          {log.user_role && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              <MdShield size={10} /> {log.user_role}
                            </span>
                          )}
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          {/* Action Badge */}
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${config.badge}`}>
                            <IconComponent size={13} /> {config.label}
                          </span>
                        </div>

                        {/* Log Details */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {log.details || `Performed ${log.action_type} on ${log.product_name}`}
                        </p>

                        {/* Stock Transition if available */}
                        {log.previous_stock !== null && log.new_stock !== null && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pt-0.5">
                            <span>Stock on hand:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{log.previous_stock}</span>
                            <MdArrowForward size={12} className="text-slate-400" />
                            <span className={`font-bold ${log.new_stock > log.previous_stock ? 'text-emerald-600 dark:text-emerald-400' : log.new_stock < log.previous_stock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {log.new_stock}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Timestamp */}
                    <div className="text-right sm:self-center self-end flex-shrink-0">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap bg-slate-50 dark:bg-dark-700 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-white/5">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-dark-800/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Immutable audit log history stored securely.
          </p>
          <button
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
