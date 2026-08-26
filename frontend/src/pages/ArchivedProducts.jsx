import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdSearch, MdClose, MdArchive, MdRestore, MdFileDownload,
  MdFilterList, MdHistory
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Avatar from '../components/Avatar'
import ProductLogHistoryModal from '../components/ProductLogHistoryModal'
import ProductDetailModal from '../components/ProductDetailModal'
import { productsAPI, categoriesAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

export default function ArchivedProducts() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isAdmin = user?.role === 'admin'

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProductDetails, setSelectedProductDetails] = useState(null)
  const [selectedProductLog, setSelectedProductLog] = useState(null)

  const fetchArchived = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsAPI.list({
        search: search.trim() || undefined,
        category: category || undefined,
        status: 'inactive',
        page,
        per_page: 10,
      })
      setProducts(res.data.products || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load archived products')
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  useEffect(() => {
    fetchArchived()
  }, [fetchArchived])

  useEffect(() => {
    categoriesAPI.active()
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {})
  }, [])

  async function handleRestore(id, name) {
    if (!window.confirm(`Restore product "${name}" to active inventory?`)) return
    try {
      await productsAPI.restore(id)
      toast.success(`Product "${name}" restored successfully!`)
      fetchArchived()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to restore product')
    }
  }

  async function handleExportExcel() {
    try {
      const res = await productsAPI.list({
        search: search.trim() || undefined,
        category: category || undefined,
        status: 'inactive',
        per_page: 1000,
        page: 1,
      })
      const data = res.data.products || []
      const columns = ['Product ID', 'Product Name', 'Category', 'Quantity', 'Price (₹)', 'SKU', 'Barcode', 'Archived Stock']
      const rows = data.map((p) => [
        p.id,
        p.name,
        p.category || '—',
        p.size,
        `₹${Number(p.price).toFixed(2)}`,
        p.sku,
        p.barcode || '—',
        p.quantity ?? 0,
      ])
      exportToExcel('Archived_Products', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export archived products')
    }
  }

  return (
    <Layout title="Archived Products">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="archived-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search archived by name or SKU…"
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

            {/* Category Filter */}
            <div className="relative w-full sm:w-48">
              <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select
                id="archived-cat-filter"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                className="select-field pl-10 pr-4 w-full text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export archived products to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} archived product{total !== 1 ? 's' : ''} saved for reference
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table with Sticky Column Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="archived" size="lg" text={t('loadingModule', 'Loading archived catalog…')} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={MdArchive}
            title="No archived products"
            subtitle="Deactivated products will appear here for future reference"
          />
        ) : (
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>SKU</th>
                <th>Remaining Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {/* Clickable Product Image / Name opens E-Commerce Center Details Modal */}
                    <div
                      onClick={() => setSelectedProductDetails(p)}
                      className="flex items-center gap-3 cursor-pointer group/item select-none"
                      title="Click to view full product details"
                    >
                      <div className="relative group/thumb flex-shrink-0">
                        <Avatar
                          src={p.image_url}
                          name={p.name}
                          size="md"
                          rounded="rounded-xl"
                          className="group-hover/thumb:scale-105 group-hover/thumb:ring-2 group-hover/thumb:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                          {p.name}
                        </p>
                        {p.barcode && (
                          <p className="text-[11px] font-mono text-slate-400">
                            {p.barcode}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{p.category || '—'}</td>
                  <td className="text-slate-700 dark:text-slate-300 font-medium">{p.size}</td>
                  <td className="font-semibold text-slate-700 dark:text-slate-300">
                    ₹{Number(p.price).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {p.sku}
                  </td>
                  <td className="font-medium text-slate-600 dark:text-slate-400">
                    {p.quantity ?? 0}
                  </td>
                  <td>
                    <span className="badge-amber">Archived</span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Log History */}
                      <button
                        onClick={() => setSelectedProductLog(p)}
                        title="View Staff Log History"
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <MdHistory size={17} />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleRestore(p.id, p.name)}
                          className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                          title="Restore product to active inventory"
                        >
                          <MdRestore size={16} /> Restore
                        </button>
                      )}
                    </div>
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
