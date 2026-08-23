import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdClose, MdShoppingCart, MdCalendarToday, MdArrowDownward,
  MdFileDownload
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { ordersAPI, productsAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDateTime } from '../utils/formatDate'

const EMPTY_FORM = { product_id: '', quantity: '' }

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])

  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.list({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 10,
      })
      setOrders(res.data.orders || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (showModal) {
      productsAPI.list({ per_page: 200, status: 'active' })
        .then((res) => setProducts(res.data.products || []))
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
      await ordersAPI.create({
        product_id: parseInt(form.product_id),
        quantity: qty,
      })
      toast.success('Order placed successfully (Stock OUT)!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
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
      const res = await ordersAPI.list({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: 1000,
        page: 1,
      })
      const data = res.data.orders || []
      const columns = ['Order No', 'Product Name', 'SKU', 'Quantity Ordered', 'Placed By', 'Order Date & Time']
      const rows = data.map((o) => [
        `ORD-${String(o.id).padStart(4, '0')}`,
        o.product_name,
        o.sku,
        o.quantity,
        o.created_by_name || '—',
        formatDateTime(o.order_date),
      ])
      exportToExcel('Orders_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export orders')
    }
  }

  return (
    <Layout title="Orders">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Reliable Date Range Picker */}
            <div className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">From:</span>
                <input
                  ref={fromDateRef}
                  id="order-date-from"
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
                  id="order-date-to"
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

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Excel Export */}
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export filtered orders to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            <button
              id="add-order-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2.5"
            >
              <MdAdd size={18} /> Place Order
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} order{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table with Sticky Column Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading orders…" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={MdShoppingCart}
            title="No orders yet"
            subtitle={dateFrom || dateTo ? 'Try clearing the date filter' : 'Place your first order using the button above'}
          />
        ) : (
          <table className="data-table min-w-[750px]">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Quantity Ordered</th>
                <th>Placed By</th>
                <th>Order Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                    ORD-{String(o.id).padStart(4, '0')}
                  </td>
                  <td className="font-semibold text-slate-800 dark:text-slate-200">
                    {o.product_name}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {o.sku}
                  </td>
                  <td>
                    <span className="badge-red flex items-center gap-1 w-fit font-semibold">
                      <MdArrowDownward size={12} /> -{o.quantity}
                    </span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">
                    {o.created_by_name || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(o.order_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Place Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Place Order (Stock OUT)</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Placing an order reduces product stock from inventory. Ensure sufficient quantity is in stock.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">Product Name *</label>
                <select
                  id="order-product"
                  required
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  className="select-field text-sm"
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {p.quantity ?? 0} in stock
                    </option>
                  ))}
                </select>
              </div>

              {/* Compact Quantity Field */}
              <div>
                <label className="form-label">Quantity to Order *</label>
                <input
                  id="order-qty"
                  required
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Units"
                  className="input-field text-sm max-w-[140px]"
                />
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
                  id="create-order-submit"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Placing…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
