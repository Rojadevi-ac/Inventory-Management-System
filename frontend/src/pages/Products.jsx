import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdInventory, MdFilterList,
  MdFileDownload, MdEdit, MdDeleteOutline, MdHistory
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Avatar from '../components/Avatar'
import ImageUploadPicker from '../components/ImageUploadPicker'
import ProductLogHistoryModal from '../components/ProductLogHistoryModal'
import ProductDetailModal from '../components/ProductDetailModal'
import { productsAPI, categoriesAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

const EMPTY_FORM = {
  name: '',
  category_id: '',
  size: '',
  price: '',
  sku: '',
  barcode: '',
  image_url: '',
  reorder_level: 10,
}

export default function Products() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canModify = isAdmin || isManager

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProductDetails, setSelectedProductDetails] = useState(null)
  const [selectedProductLog, setSelectedProductLog] = useState(null)
  const [showGlobalLogs, setShowGlobalLogs] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsAPI.list({
        search: search.trim() || undefined,
        category: category || undefined,
        status: 'active',
        page,
        per_page: 10,
      })
      setProducts(res.data.products || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.active()
      setCategories(res.data.categories || [])
    } catch {
      // Fallback
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function openCreateModal() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(prod) {
    setEditingProduct(prod)
    setForm({
      name: prod.name || '',
      category_id: prod.category_id || '',
      size: prod.size || '',
      price: prod.price || '',
      sku: prod.sku || '',
      barcode: prod.barcode || '',
      image_url: prod.image_url || '',
      reorder_level: prod.reorder_level ?? 10,
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id || !form.size.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, {
          name: form.name.trim(),
          category_id: parseInt(form.category_id),
          size: form.size.trim(),
          price: parseFloat(form.price),
          sku: form.sku.trim() || undefined,
          barcode: form.barcode.trim() || null,
          image_url: form.image_url.trim() || null,
          reorder_level: parseInt(form.reorder_level) || 0,
        })
        toast.success('Product updated successfully!')
      } else {
        await productsAPI.create({
          name: form.name.trim(),
          category_id: parseInt(form.category_id),
          size: form.size.trim(),
          price: parseFloat(form.price),
          sku: form.sku.trim() || undefined,
          barcode: form.barcode.trim() || null,
          image_url: form.image_url.trim() || null,
          reorder_level: parseInt(form.reorder_level) || 0,
        })
        toast.success('Product created successfully!')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleArchive(id, name) {
    if (!window.confirm(`Archive "${name}"? It can be viewed or restored in Archived Products.`)) return
    try {
      await productsAPI.delete(id)
      toast.success(`"${name}" archived`)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to archive product')
    }
  }

  async function handleExportExcel() {
    try {
      const res = await productsAPI.list({
        search: search.trim() || undefined,
        category: category || undefined,
        status: 'active',
        per_page: 1000,
        page: 1,
      })
      const data = res.data.products || []
      const columns = ['Product Name', 'Category', 'Quantity', 'Price (₹)', 'SKU', 'Barcode', 'Stock on Hand', 'Stock Status']
      const rows = data.map((p) => [
        p.name,
        p.category || '—',
        p.size,
        `₹${Number(p.price).toFixed(2)}`,
        p.sku,
        p.barcode || '—',
        p.quantity ?? 0,
        p.low_stock ? 'Low Stock' : 'In Stock',
      ])
      exportToExcel('Products_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export products')
    }
  }

  return (
    <Layout title="Products">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="product-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or SKU…"
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

            {/* Category filter */}
            <div className="relative w-full sm:w-48">
              <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select
                id="product-category-filter"
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

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* View All Staff Logs button */}
            <button
              onClick={() => setShowGlobalLogs(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm py-2.5"
              title="View all staff activity and product logs"
            >
              <MdHistory size={18} className="text-indigo-500" />
              <span>Log History</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export filtered products to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            {canModify && (
              <button
                id="add-product-btn"
                onClick={openCreateModal}
                className="btn-primary flex items-center gap-2 text-sm py-2.5"
              >
                <MdAdd size={18} /> Add Product
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} active product{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table with Sticky Column Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="products" size="lg" text={t('loading', 'Loading products…')} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={MdInventory}
            title={t('noProducts', 'No products found')}
            subtitle={search || category ? 'Try adjusting your search filters' : 'Add your first product using the button above'}
          />
        ) : (
          <table className="data-table min-w-[850px]">
            <thead>
              <tr>
                <th>{t('productName', 'Product')}</th>
                <th>{t('categoryName', 'Category')}</th>
                <th>{t('quantity', 'Quantity')}</th>
                <th>{t('price', 'Price')}</th>
                <th>{t('sku', 'SKU')}</th>
                <th>{t('stockOnHand', 'Stock on Hand')}</th>
                <th>{t('status', 'Stock Status')}</th>
                <th className="text-right">{t('actions', 'Actions')}</th>
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
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
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
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300">
                      {p.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="text-slate-700 dark:text-slate-300 font-medium">{p.size}</td>
                  <td className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(p.price).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {p.sku}
                  </td>
                  <td className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.quantity ?? 0}
                  </td>
                  <td>
                    {p.low_stock ? (
                      <span className="badge-red">Low Stock</span>
                    ) : (
                      <span className="badge-green">In Stock</span>
                    )}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Log History Button */}
                      <button
                        onClick={() => setSelectedProductLog(p)}
                        title="View Staff Log History for this product"
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <MdHistory size={17} />
                      </button>

                      {canModify && (
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          <MdEdit size={16} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleArchive(p.id, p.name)}
                          title="Archive Product"
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <MdDeleteOutline size={16} />
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
          onEdit={(prod) => openEditModal(prod)}
          canModify={canModify}
        />
      )}

      {/* Product-Specific Log History Modal with Staff & Action Dropdowns */}
      {selectedProductLog && (
        <ProductLogHistoryModal
          product={selectedProductLog}
          onClose={() => setSelectedProductLog(null)}
        />
      )}

      {/* Global Staff Activity Log History Modal */}
      {showGlobalLogs && (
        <ProductLogHistoryModal
          product={null}
          onClose={() => setShowGlobalLogs(false)}
        />
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Image: Click to choose from desktop */}
              <ImageUploadPicker
                value={form.image_url}
                onChange={(newUrl) => setForm({ ...form, image_url: newUrl })}
                name={form.name || 'Product'}
                label="Product Image"
                shape="rounded-2xl"
                size="xl"
                helperText="Click picture or 'Choose from Desktop' to select an image from your computer."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Product Name *</label>
                  <input
                    id="prod-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Blue Denim Jeans, Full Cream Milk"
                    className="input-field text-sm"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    id="prod-cat"
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="select-field text-sm"
                  >
                    <option value="">Select Category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity Field */}
                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    id="prod-size"
                    required
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="e.g. 1L, 500g, 5kg, Standard, 10 pcs"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input
                    id="prod-price"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="input-field text-sm max-w-[180px]"
                  />
                </div>

                <div>
                  <label className="form-label">Reorder Alert Level</label>
                  <input
                    id="prod-reorder"
                    type="number"
                    min="0"
                    value={form.reorder_level}
                    onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                    className="input-field text-sm max-w-[140px]"
                  />
                </div>

                <div>
                  <label className="form-label">SKU (optional)</label>
                  <input
                    id="prod-sku"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="input-field text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="form-label">Barcode (optional)</label>
                  <input
                    id="prod-barcode"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Scan or enter barcode"
                    className="input-field text-sm font-mono"
                  />
                </div>
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
                  id="create-product-submit"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
