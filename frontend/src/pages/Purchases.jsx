import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdAddShoppingCart, MdCalendarToday,
  MdFileDownload
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDateTime } from '../utils/formatDate'

const EMPTY_FORM = { product_id: '', quantity: '', supplier_id: '' }

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  const fetchPurchases = useCallback(async () => {
    setLoading(true)
    try {
      const res = await purchasesAPI.list({
        search: search.trim() || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 10,
      })
      setPurchases(res.data.purchases || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }, [search, dateFrom, dateTo, page])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  useEffect(() => {
    if (showModal) {
      productsAPI.list({ per_page: 200, status: 'active' })
        .then((res) => setProducts(res.data.products || []))
        .catch(() => {})
      suppliersAPI.list({ per_page: 200 })
        .then((res) => setSuppliers(res.data.suppliers || []))
        .catch(() => {})
    }
  }, [showModal])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.product_id || !form.quantity) {
      toast.error('Please select a product and enter a quantity')
      return
    }
    const qty = parseInt(form.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be a positive integer')
      return
    }

    setSubmitting(true)
    try {
      await purchasesAPI.create({
        product_id: parseInt(form.product_id),
        quantity: qty,
        supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      })
      toast.success('Purchase recorded successfully!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchPurchases()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record purchase')
    } finally {
      setSubmitting(false)
    }
  }

  function handleResetDates() {
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  async function handleExportExcel() {
    try {
      const res = await purchasesAPI.list({
        search: search.trim() || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: 1000,
        page: 1,
      })
      const data = res.data.purchases || []
      const columns = ['Purchase No', 'Product Name', 'SKU', 'Quantity Received', 'Supplier Name', 'Recorded By', 'Purchase Date & Time']
      const rows = data.map((p) => [
        `PUR-${String(p.id).padStart(4, '0')}`,
        p.product_name,
        p.sku,
        p.quantity,
        p.supplier_name || '—',
        p.created_by_name || '—',
        formatDateTime(p.purchase_date),
      ])
      exportToExcel('Purchases_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export purchases')
    }
  }

  return (
    <Layout title="Purchases">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="purchase-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search purchase, product, supplier…"
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

            {/* Reliable Date Range Picker */}
            <div className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">From:</span>
                <input
                  ref={fromDateRef}
                  id="purchase-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
                  title="Filter from date"
                />
              </div>

              <span className="text-slate-300 dark:text-slate-600">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">To:</span>
                <input
                  ref={toDateRef}
                  id="purchase-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
                  title="Filter to date"
                />
              </div>

              {(dateFrom || dateTo) && (
                <button
                  onClick={handleResetDates}
                  title="Clear Date Filter"
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                >
                  <MdClose size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Excel Export */}
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export filtered purchases to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            <button
              id="add-purchase-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2.5"
            >
              <MdAdd size={18} /> Record Purchase
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} purchase{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table Container with Sticky Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading purchases…" />
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState
            icon={MdAddShoppingCart}
            title="No purchases found"
            subtitle={search || dateFrom || dateTo ? 'Try clearing filters' : 'Record your first stock purchase using the button above'}
          />
        ) : (
          <table className="data-table min-w-[850px]">
            <thead>
              <tr>
                <th>Purchase No</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Quantity Received</th>
                <th>Supplier Name</th>
                <th>Recorded By</th>
                <th>Purchase Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    PUR-{String(p.id).padStart(4, '0')}
                  </td>
                  <td className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.product_name}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {p.sku}
                  </td>
                  <td>
                    <span className="badge-green font-semibold">
                      +{p.quantity}
                    </span>
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    {p.supplier_name || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">
                    {p.created_by_name || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(p.purchase_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Record Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Record Purchase (Stock IN)</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">Product Name *</label>
                <select
                  id="purchase-product"
                  required
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  className="select-field text-sm"
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* Compact Quantity Field */}
              <div>
                <label className="form-label">Quantity Received *</label>
                <input
                  id="purchase-qty"
                  required
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Units"
                  className="input-field text-sm max-w-[140px]"
                />
              </div>

              <div>
                <label className="form-label">Supplier Name (optional)</label>
                <select
                  id="purchase-supplier"
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="select-field text-sm"
                >
                  <option value="">— No supplier / Direct —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  id="create-purchase-submit"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Recording…' : 'Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
