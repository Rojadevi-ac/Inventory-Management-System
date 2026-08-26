import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdCategory, MdEdit, MdDeleteOutline,
  MdFileDownload, MdFilterList, MdCheckCircle, MdCancel
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { categoriesAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDateTime } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

const EMPTY_FORM = { name: '', description: '', status: 'active' }

export default function Categories() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canModify = isAdmin || isManager

  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoriesAPI.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        per_page: 10,
      })
      setCategories(res.data.categories || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function openCreateModal() {
    setEditingCategory(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(cat) {
    setEditingCategory(cat)
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      status: cat.status || 'active',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSubmitting(true)
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          status: form.status,
        })
        toast.success('Category updated successfully!')
      } else {
        await categoriesAPI.create({
          name: form.name.trim(),
          description: form.description.trim() || null,
        })
        toast.success('Category created successfully!')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(id, name) {
    if (!window.confirm(`Are you sure you want to deactivate category "${name}"?`)) return
    try {
      await categoriesAPI.delete(id)
      toast.success(`Category "${name}" deactivated`)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate category')
    }
  }

  async function handleExportExcel() {
    try {
      const res = await categoriesAPI.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page: 1,
        per_page: 1000,
      })
      const data = res.data.categories || []
      const columns = ['Category ID', 'Category Name', 'Description', 'Products Linked', 'Status', 'Created At']
      const rows = data.map((c) => [
        c.id,
        c.name,
        c.description || '—',
        c.product_count || 0,
        c.status === 'active' ? 'Active' : 'Inactive',
        formatDateTime(c.created_at),
      ])
      exportToExcel('Categories_List', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export categories')
    }
  }

  return (
    <Layout title="Categories">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Compact Search Field */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="category-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search categories…"
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

            {/* Status Filter */}
            <div className="relative w-full sm:w-44">
              <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select
                id="category-status-filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="select-field pl-10 pr-4 w-full text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export filtered categories to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            {canModify && (
              <button
                id="add-category-btn"
                onClick={openCreateModal}
                className="btn-primary flex items-center gap-2 text-sm py-2.5"
              >
                <MdAdd size={18} /> Add Category
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} categor{total !== 1 ? 'ies' : 'y'} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table Container with Sticky Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="categories" size="lg" text={t('loadingModule', 'Loading categories…')} />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={MdCategory}
            title="No categories found"
            subtitle={search || statusFilter ? 'Try clearing filters' : 'Create your first product category'}
          />
        ) : (
          <table className="data-table min-w-[700px]">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Category Description</th>
                <th>Products Linked</th>
                <th>Category Status</th>
                <th>Created At</th>
                {canModify && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.name}
                  </td>
                  <td className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {c.description || <span className="text-slate-400 dark:text-slate-600 italic">No description</span>}
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                      {c.product_count || 0} items
                    </span>
                  </td>
                  <td>
                    {c.status === 'active' ? (
                      <span className="badge-green flex items-center gap-1 w-fit">
                        <MdCheckCircle size={13} /> Active
                      </span>
                    ) : (
                      <span className="badge-amber flex items-center gap-1 w-fit">
                        <MdCancel size={13} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(c.created_at)}
                  </td>
                  {canModify && (
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <MdEdit size={16} />
                        </button>
                        {isAdmin && c.status === 'active' && (
                          <button
                            onClick={() => handleDeactivate(c.id, c.name)}
                            title="Deactivate Category"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  id="category-name-input"
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Electronics, Grocery, Apparel"
                  className="input-field text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Category Description (optional)</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this category…"
                  className="input-field text-sm resize-none"
                />
              </div>

              {editingCategory && (
                <div>
                  <label className="form-label">Category Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="select-field text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Saving…' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
