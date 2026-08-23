import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdReportProblem, MdFilterList,
  MdFileDownload, MdEdit, MdCheckCircle, MdOutlineChangeCircle,
  MdLocalShipping, MdInventory, MdInfoOutline, MdWarning
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Avatar from '../components/Avatar'
import { supplierIssuesAPI, suppliersAPI, productsAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'

const ISSUE_TYPES = [
  'Damaged',
  'Defective',
  'Expired',
  'Short Quantity',
  'Wrong Product',
  'Wrong Specification',
  'Packaging Damage',
  'Other',
]

const ISSUE_REASONS = {
  Damaged: [
    'Broken',
    'Leakage',
    'Physical Damage',
    'Packaging Damage',
    'Water Damage',
    'Handling Damage',
    'Manufacturing Defect',
    'Other',
  ],
  Defective: [
    'Manufacturing Defect',
    'Component Failure',
    'Poor Workmanship',
    'Seal Broken',
    'Not Working',
    'Other',
  ],
  'Wrong Product': [
    'Incorrect Product',
    'Incorrect Variant',
    'Incorrect Size',
    'Incorrect Model',
    'Other',
  ],
  'Short Quantity': [
    'Fewer Units than Invoiced',
    'Missing Carton/Box',
    'Weight Shortage',
    'Other',
  ],
  Expired: [
    'Expired Upon Delivery',
    'Near Expiry (< 30 Days)',
    'Unlabeled Expiry Date',
    'Other',
  ],
  'Packaging Damage': [
    'Crushed Carton',
    'Torn Bag',
    'Broken Seal',
    'Moisture Ingress',
    'Other',
  ],
  'Wrong Specification': [
    'Wrong Color/Grade',
    'Wrong Pack Size',
    'Wrong Barcode',
    'Other',
  ],
  Other: ['Other Reason'],
}

const STATUS_WORKFLOW = [
  'Reported',
  'Under Review',
  'Approved',
  'Return Requested',
  'Returned',
  'Replacement Requested',
  'Replacement Received',
  'Resolved',
  'Rejected',
]

const RESOLUTION_TYPES = [
  'Return to Supplier',
  'Replacement',
  'Credit Note',
  'Accepted with Damage',
  'Disposed',
  'No Action',
  'Other',
]

const STATUS_BADGES = {
  Reported: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  'Under Review': 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  Approved: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  'Return Requested': 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  Returned: 'bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-500/30',
  'Replacement Requested': 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
  'Replacement Received': 'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
  Resolved: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  Rejected: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
}

const EMPTY_FORM = {
  supplier_id: '',
  purchase_id: '',
  product_id: '',
  quantity: '',
  issue_type: 'Damaged',
  reason: 'Broken',
  notes: '',
  deduct_inventory: true,
}

export default function SupplierIssues() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canModify = isAdmin || isManager

  const [issues, setIssues] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [issueTypeFilter, setIssueTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [resolutionFilter, setResolutionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

  // Dropdown data
  const [suppliers, setSuppliers] = useState([])
  const [supplierPurchases, setSupplierPurchases] = useState([])
  const [damageSummary, setDamageSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', resolution: '', notes: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supplierIssuesAPI.list({
        search: search.trim() || undefined,
        supplier_id: supplierFilter || undefined,
        issue_type: issueTypeFilter || undefined,
        status: statusFilter || undefined,
        resolution: resolutionFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 10,
      })
      setIssues(res.data.issues || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load supplier damage records')
    } finally {
      setLoading(false)
    }
  }, [search, supplierFilter, issueTypeFilter, statusFilter, resolutionFilter, dateFrom, dateTo, page])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  useEffect(() => {
    suppliersAPI.list({ per_page: 200 })
      .then((res) => setSuppliers(res.data.suppliers || []))
      .catch(() => {})
  }, [])

  // When Supplier is selected in Create Modal, load that supplier's purchases
  async function handleSupplierChange(supplierId) {
    setForm((prev) => ({ ...prev, supplier_id: supplierId, purchase_id: '', product_id: '', quantity: '' }))
    setDamageSummary(null)
    if (!supplierId) {
      setSupplierPurchases([])
      return
    }
    try {
      const res = await supplierIssuesAPI.getPurchases(supplierId)
      setSupplierPurchases(res.data.purchases || [])
    } catch {
      toast.error('Failed to load purchases for this supplier')
      setSupplierPurchases([])
    }
  }

  // When Purchase is selected, auto-select or filter products belonging to that purchase
  function handlePurchaseChange(purchaseId) {
    setForm((prev) => ({ ...prev, purchase_id: purchaseId, product_id: '', quantity: '' }))
    setDamageSummary(null)
    const pur = supplierPurchases.find((p) => p.purchase_id === parseInt(purchaseId))
    if (pur) {
      setForm((prev) => ({ ...prev, product_id: pur.product_id }))
      loadDamageSummary(purchaseId, pur.product_id)
    }
  }

  async function loadDamageSummary(purchaseId, productId) {
    if (!purchaseId || !productId) return
    setLoadingSummary(true)
    try {
      const res = await supplierIssuesAPI.getDamageSummary(purchaseId, productId)
      setDamageSummary(res.data)
    } catch {
      setDamageSummary(null)
    } finally {
      setLoadingSummary(false)
    }
  }

  function handleIssueTypeChange(type) {
    const defaultReason = (ISSUE_REASONS[type] && ISSUE_REASONS[type][0]) || 'Other'
    setForm((prev) => ({ ...prev, issue_type: type, reason: defaultReason }))
  }

  async function handleCreateSubmit(e) {
    e.preventDefault()
    if (!form.supplier_id || !form.purchase_id || !form.product_id || !form.quantity) {
      toast.error('Please fill in all required fields')
      return
    }

    const qty = parseInt(form.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be a positive integer')
      return
    }

    if (damageSummary && qty > damageSummary.remaining_quantity) {
      toast.error(`Damage quantity exceeds remaining quantity (${damageSummary.remaining_quantity} available) for this purchase.`)
      return
    }

    setSubmitting(true)
    try {
      await supplierIssuesAPI.create({
        supplier_id: parseInt(form.supplier_id),
        purchase_id: parseInt(form.purchase_id),
        product_id: parseInt(form.product_id),
        quantity: qty,
        issue_type: form.issue_type,
        reason: form.reason,
        notes: form.notes.trim() || undefined,
        deduct_inventory: form.deduct_inventory,
      })
      toast.success('Supplier issue & damage reported successfully!')
      setShowCreateModal(false)
      setForm(EMPTY_FORM)
      setDamageSummary(null)
      fetchIssues()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record supplier issue')
    } finally {
      setSubmitting(false)
    }
  }

  function openStatusModal(issue) {
    setSelectedIssue(issue)
    setStatusForm({
      status: issue.status,
      resolution: issue.resolution || '',
      notes: issue.notes || '',
    })
    setShowStatusModal(true)
  }

  async function handleStatusSubmit(e) {
    e.preventDefault()
    if (!statusForm.status) {
      toast.error('Status is required')
      return
    }

    setSubmitting(true)
    try {
      await supplierIssuesAPI.updateStatus(selectedIssue.id, {
        status: statusForm.status,
        resolution: statusForm.resolution || undefined,
        notes: statusForm.notes.trim() || undefined,
      })
      toast.success(`Issue updated to '${statusForm.status}'`)
      setShowStatusModal(false)
      fetchIssues()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Status update failed')
    } finally {
      setSubmitting(false)
    }
  }

  function handleResetFilters() {
    setSearch('')
    setSupplierFilter('')
    setIssueTypeFilter('')
    setStatusFilter('')
    setResolutionFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  async function handleExportExcel() {
    try {
      const res = await supplierIssuesAPI.list({
        search: search.trim() || undefined,
        supplier_id: supplierFilter || undefined,
        issue_type: issueTypeFilter || undefined,
        status: statusFilter || undefined,
        resolution: resolutionFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: 1000,
        page: 1,
      })
      const data = res.data.issues || []
      const columns = [
        'Supplier',
        'Product',
        'SKU',
        'Issue Type',
        'Quantity',
        'Reason',
        'Status',
        'Resolution',
        'Date',
        'Created By',
      ]
      const rows = data.map((i) => [
        i.supplier_name,
        i.product_name,
        i.sku,
        i.issue_type,
        i.quantity,
        i.reason,
        i.status,
        i.resolution || '—',
        formatDateTime(i.issue_date),
        i.created_by_name || '—',
      ])
      exportToExcel('Supplier_Damages_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export supplier issues')
    }
  }

  return (
    <Layout title="Damages & Supplier Issues">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="issue-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search supplier, product, SKU…"
                className="input-field pl-10 pr-8 w-full text-sm"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <MdClose size={16} />
                </button>
              )}
            </div>

            {/* Supplier Filter */}
            <div className="relative w-full sm:w-48">
              <select
                id="issue-supplier-filter"
                value={supplierFilter}
                onChange={(e) => { setSupplierFilter(e.target.value); setPage(1) }}
                className="select-field text-xs py-2"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Issue Type Filter */}
            <div className="relative w-full sm:w-40">
              <select
                id="issue-type-filter"
                value={issueTypeFilter}
                onChange={(e) => { setIssueTypeFilter(e.target.value); setPage(1) }}
                className="select-field text-xs py-2"
              >
                <option value="">All Issue Types</option>
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-40">
              <select
                id="issue-status-filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="select-field text-xs py-2"
              >
                <option value="">All Statuses</option>
                {STATUS_WORKFLOW.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Resolution Filter */}
            <div className="relative w-full sm:w-40">
              <select
                id="issue-resolution-filter"
                value={resolutionFilter}
                onChange={(e) => { setResolutionFilter(e.target.value); setPage(1) }}
                className="select-field text-xs py-2"
              >
                <option value="">All Resolutions</option>
                {RESOLUTION_TYPES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export supplier issues to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            <button
              id="report-issue-btn"
              onClick={() => { setForm(EMPTY_FORM); setDamageSummary(null); setShowCreateModal(true) }}
              className="btn-primary flex items-center gap-2 text-sm py-2.5"
            >
              <MdAdd size={18} /> Report Damage / Issue
            </button>
          </div>
        </div>

        {/* Date Range & Clear Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">From:</span>
              <input
                ref={fromDateRef}
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">To:</span>
              <input
                ref={toDateRef}
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {(search || supplierFilter || issueTypeFilter || statusFilter || resolutionFilter || dateFrom || dateTo) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Reset All Filters
            </button>
          )}

          <p className="text-xs text-slate-500 ml-auto">
            {total} record{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Table (Strictly NO Issue No, NO Purchase No, and NO Product Image) */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading damage records…" />
          </div>
        ) : issues.length === 0 ? (
          <EmptyState
            icon={MdReportProblem}
            title="No supplier issues found"
            subtitle={search || supplierFilter || statusFilter ? 'Try clearing your filters' : 'Report supplier damaged or defective stock using the button above'}
          />
        ) : (
          <table className="data-table min-w-[1000px]">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 bg-slate-100 dark:bg-dark-800 z-30 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)] whitespace-nowrap min-w-[180px]">
                  Supplier
                </th>
                <th>Product</th>
                <th className="whitespace-nowrap min-w-[140px]">SKU</th>
                <th>Issue Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Resolution</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => {
                const statusClass = STATUS_BADGES[i.status] || 'bg-slate-100 text-slate-700 border-slate-200'

                return (
                  <tr key={i.id} className="group">
                    <td className="sticky left-0 bg-white dark:bg-dark-900 group-hover:bg-slate-50 dark:group-hover:bg-dark-800 z-20 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)] transition-colors min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <Avatar src={i.supplier_logo} name={i.supplier_name} size="xs" rounded="rounded-md" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">
                          {i.supplier_name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">
                        {i.product_name}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap min-w-[140px] tracking-wider">
                      {i.sku}
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20 whitespace-nowrap">
                        {i.issue_type}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {i.quantity}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 dark:text-slate-400 max-w-[160px] truncate" title={i.reason}>
                      {i.reason}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${statusClass}`}>
                        {i.status}
                      </span>
                    </td>
                    <td>
                      {i.resolution ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 whitespace-nowrap">
                          {i.resolution}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(i.issue_date)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {canModify && (
                        <button
                          onClick={() => openStatusModal(i)}
                          title="Update Status / Resolution"
                          className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:border-indigo-500/50"
                        >
                          <MdOutlineChangeCircle size={14} className="text-indigo-500" />
                          <span>Status</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ── Report Damage / Supplier Issue Modal ─────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 animate-slide-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <MdReportProblem size={18} />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Report Supplier Damage / Issue</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* 1. Supplier Dropdown (Existing Suppliers) */}
              <div>
                <label className="form-label">1. Supplier *</label>
                <select
                  id="form-supplier"
                  required
                  value={form.supplier_id}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="select-field text-sm"
                >
                  <option value="">Select Existing Supplier…</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contact_person || 'Vendor'})</option>
                  ))}
                </select>
              </div>

              {/* 2. Purchase Dropdown (Strictly dependent on selected supplier) */}
              <div>
                <label className="form-label">2. Purchase (Stock In Order) *</label>
                <select
                  id="form-purchase"
                  required
                  disabled={!form.supplier_id || supplierPurchases.length === 0}
                  value={form.purchase_id}
                  onChange={(e) => handlePurchaseChange(e.target.value)}
                  className="select-field text-sm disabled:opacity-50"
                >
                  <option value="">
                    {!form.supplier_id
                      ? '— First select a supplier above —'
                      : supplierPurchases.length === 0
                      ? '— No purchases found for this supplier —'
                      : 'Select Purchase Order…'}
                  </option>
                  {supplierPurchases.map((p) => (
                    <option key={p.purchase_id} value={p.purchase_id}>
                      {p.purchase_no} — {p.product_name} ({p.purchased_quantity} units) — {formatDate(p.purchase_date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Product Display / Dropdown (Strictly dependent on Purchase) */}
              {form.purchase_id && (
                <div>
                  <label className="form-label">3. Affected Product *</label>
                  <input
                    readOnly
                    value={
                      damageSummary
                        ? `${damageSummary.product_name} (${damageSummary.sku})`
                        : 'Loading product…'
                    }
                    className="input-field text-sm bg-slate-100 dark:bg-dark-800 font-medium cursor-not-allowed"
                  />
                </div>
              )}

              {/* 4. Live Quantity Validation Box */}
              {damageSummary && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-800/80 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Purchased Quantity:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{damageSummary.purchased_quantity} units</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Already Reported Damage:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{damageSummary.already_reported_damage} units</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Remaining Available for Damage:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {damageSummary.remaining_quantity} units
                    </span>
                  </div>
                </div>
              )}

              {/* 5. Quantity Input with Validation */}
              <div>
                <label className="form-label">Damaged / Issue Quantity *</label>
                <input
                  id="form-qty"
                  required
                  type="number"
                  min="1"
                  max={damageSummary ? damageSummary.remaining_quantity : undefined}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 5"
                  className="input-field text-sm max-w-[140px]"
                />
                {damageSummary && parseInt(form.quantity) > damageSummary.remaining_quantity && (
                  <p className="text-xs text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <MdWarning size={14} /> Damage quantity exceeds the remaining quantity for this purchase ({damageSummary.remaining_quantity} max).
                  </p>
                )}
              </div>

              {/* 6. Issue Type & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Issue Type *</label>
                  <select
                    id="form-issue-type"
                    required
                    value={form.issue_type}
                    onChange={(e) => handleIssueTypeChange(e.target.value)}
                    className="select-field text-sm"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Reason *</label>
                  <select
                    id="form-reason"
                    required
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="select-field text-sm"
                  >
                    {(ISSUE_REASONS[form.issue_type] || ['Other']).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 7. Notes */}
              <div>
                <label className="form-label">Notes & Inspection Details (optional)</label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. 5 packets were damaged when received from supplier"
                  className="input-field text-sm resize-none"
                />
              </div>

              {/* 8. Deduct Inventory Option */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="deduct-inventory"
                  type="checkbox"
                  checked={form.deduct_inventory}
                  onChange={(e) => setForm({ ...form, deduct_inventory: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="deduct-inventory" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Deduct affected quantity from usable warehouse inventory stock
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (damageSummary && parseInt(form.quantity) > damageSummary.remaining_quantity)}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Submitting…' : 'Report Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status & Resolution Update Modal ─────────────────────────────────── */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Update Issue Status
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedIssue.product_name} • {selectedIssue.supplier_name}
                </p>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              {/* Status Workflow Selection */}
              <div>
                <label className="form-label">Workflow Status *</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="select-field text-sm"
                >
                  {STATUS_WORKFLOW.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Resolution Type (Enabled for Resolved or Return/Replacement) */}
              <div>
                <label className="form-label">Resolution Type</label>
                <select
                  value={statusForm.resolution}
                  onChange={(e) => setStatusForm({ ...statusForm, resolution: e.target.value })}
                  className="select-field text-sm"
                >
                  <option value="">— No Resolution Yet —</option>
                  {RESOLUTION_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Resolution Notes / Action Taken</label>
                <textarea
                  rows="2"
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="e.g. Supplier agreed to replace 5 units on next delivery cycle"
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Updating…' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
