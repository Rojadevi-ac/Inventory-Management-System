import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  MdSearch, MdClose, MdStore, MdEdit, MdCheck, MdFilterList,
  MdFileDownload, MdHistory
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Avatar from '../components/Avatar'
import ProductLogHistoryModal from '../components/ProductLogHistoryModal'
import ProductDetailModal from '../components/ProductDetailModal'
import { inventoryAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDateTime } from '../utils/formatDate'
import { useLanguage } from '../context/LanguageContext'

export default function Inventory() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialStock = searchParams.get('status') || searchParams.get('stock') || ''

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState(initialStock)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [selectedProductDetails, setSelectedProductDetails] = useState(null)
  const [selectedProductLog, setSelectedProductLog] = useState(null)

  // Sync if URL search params change
  useEffect(() => {
    const s = searchParams.get('status') || searchParams.get('stock') || ''
    if (s) setStockFilter(s)
  }, [searchParams])

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryAPI.list({
        search: search.trim() || undefined,
        stock_status: stockFilter || undefined,
        page,
        per_page: 10,
      })
      setItems(res.data.inventory || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [search, stockFilter, page])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  async function saveReorder(productId) {
    const level = parseInt(editValue)
    if (isNaN(level) || level < 0) {
      toast.error('Reorder level must be a non-negative number')
      return
    }
    try {
      await inventoryAPI.updateReorder(productId, level)
      toast.success('Reorder level updated')
      setEditId(null)
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  async function handleExportExcel() {
    try {
      const res = await inventoryAPI.list({
        search: search.trim() || undefined,
        stock_status: stockFilter || undefined,
        per_page: 1000,
        page: 1,
      })
      const data = res.data.inventory || []
      const columns = ['Product Name', 'SKU', 'Category', 'Quantity', 'Qty on Hand', 'Reorder Level', 'Stock Status', 'Last Updated']
      const rows = data.map((item) => [
        item.name,
        item.sku,
        item.category || '—',
        item.size,
        item.quantity,
        item.reorder_level,
        item.low_stock ? 'Low Stock' : 'Sufficient',
        formatDateTime(item.updated_at),
      ])
      exportToExcel('Inventory_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export inventory')
    }
  }

  return (
    <Layout title="Inventory">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Compact Search Field */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="inventory-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search inventory by name or SKU…"
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

            {/* Stock status filter */}
            <div className="relative w-full sm:w-48">
              <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select
                id="inventory-stock-filter"
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
                className="select-field pl-10 pr-4 w-full text-sm"
              >
                <option value="">All stock levels</option>
                <option value="low">Low stock only</option>
                <option value="in_stock">Sufficient stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export filtered inventory to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} item{total !== 1 ? 's' : ''} in inventory
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table Container with Sticky Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="inventory" size="lg" text={t('loading', 'Syncing live stock inventory…')} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MdStore}
            title={t('noInventory', 'No inventory records')}
            subtitle={search || stockFilter ? 'Try adjusting your filters' : 'Add products first to view inventory'}
          />
        ) : (
          <table className="data-table min-w-[850px]">
            <thead>
              <tr>
                <th>{t('productName', 'Product')}</th>
                <th>{t('sku', 'SKU')}</th>
                <th>{t('categoryName', 'Category')}</th>
                <th>{t('quantity', 'Quantity')}</th>
                <th>{t('stockOnHand', 'Qty on Hand')}</th>
                <th>{t('reorderLevel', 'Reorder Level')}</th>
                <th>{t('status', 'Stock Status')}</th>
                <th>{t('lastUpdated', 'Last Updated')}</th>
                <th className="text-right">{t('history', 'History')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* Clickable Product Image / Name opens E-Commerce Center Details Modal */}
                    <div
                      onClick={() => setSelectedProductDetails(item)}
                      className="flex items-center gap-3 cursor-pointer group/item select-none"
                      title="Click to view full product details"
                    >
                      <div className="relative group/thumb flex-shrink-0">
                        <Avatar
                          src={item.image_url}
                          name={item.name}
                          size="md"
                          rounded="rounded-xl"
                          className="group-hover/thumb:scale-105 group-hover/thumb:ring-2 group-hover/thumb:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">
                          {item.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {item.sku}
                  </td>
                  <td>{item.category || '—'}</td>
                  <td className="text-slate-700 dark:text-slate-300 font-medium">{item.size}</td>
                  <td>
                    <span className={`font-bold text-base ${item.low_stock ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td>
                    {editId === item.product_id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`reorder-input-${item.product_id}`}
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input-field w-20 py-1 text-xs"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveReorder(item.product_id)}
                        />
                        <button
                          id={`save-reorder-${item.product_id}`}
                          onClick={() => saveReorder(item.product_id)}
                          className="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30"
                          title="Save"
                        >
                          <MdCheck size={16} />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                          title="Cancel"
                        >
                          <MdClose size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 dark:text-slate-300">{item.reorder_level}</span>
                        <button
                          id={`edit-reorder-${item.product_id}`}
                          onClick={() => { setEditId(item.product_id); setEditValue(item.reorder_level) }}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="Edit Reorder Level"
                        >
                          <MdEdit size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    {item.low_stock ? (
                      <span className="badge-red">Low Stock</span>
                    ) : (
                      <span className="badge-green">Sufficient</span>
                    )}
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(item.updated_at)}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedProductLog({ id: item.product_id, name: item.name, sku: item.sku, category: item.category })}
                      title="View Staff Log History"
                      className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <MdHistory size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* E-Commerce Center Product Details Card Modal */}
      {selectedProductDetails && (
        <ProductDetailModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
        />
      )}

      {/* Product Log History Modal */}
      {selectedProductLog && (
        <ProductLogHistoryModal
          product={selectedProductLog}
          onClose={() => setSelectedProductLog(null)}
        />
      )}
    </Layout>
  )
}
