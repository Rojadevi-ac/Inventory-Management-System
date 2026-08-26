import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdLocalShipping, MdEdit, MdDeleteOutline,
  MdFileDownload, MdPhone, MdEmail, MdLocationOn, MdCalendarToday,
  MdAssessment, MdReportProblem, MdCheckCircle, MdReplay, MdHourglassEmpty
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Avatar from '../components/Avatar'
import ImageUploadPicker from '../components/ImageUploadPicker'
import { suppliersAPI, supplierIssuesAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

const EMPTY_FORM = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  started_at: '',
  logo_url: '',
}

export default function Suppliers() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isAdmin = user?.role === 'admin'

  const [suppliers, setSuppliers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Quality & Issue Summary Modal
  const [qualitySupplier, setQualitySupplier] = useState(null)
  const [qualityData, setQualityData] = useState(null)
  const [loadingQuality, setLoadingQuality] = useState(false)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await suppliersAPI.list({
        search: search.trim() || undefined,
        page,
        per_page: 10,
      })
      setSuppliers(res.data.suppliers || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.total_pages || 1)
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  function openCreateModal() {
    setEditingSupplier(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(sup) {
    setEditingSupplier(sup)
    setForm({
      name: sup.name || '',
      contact_person: sup.contact_person || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      started_at: sup.started_at ? sup.started_at.slice(0, 10) : '',
      logo_url: sup.logo_url || '',
    })
    setShowModal(true)
  }

  async function openQualityModal(sup) {
    setQualitySupplier(sup)
    setQualityData(null)
    setLoadingQuality(true)
    try {
      const res = await supplierIssuesAPI.getQualitySummary(sup.id)
      setQualityData(res.data)
    } catch {
      toast.error('Failed to load quality statistics')
    } finally {
      setLoadingQuality(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.started_at) {
      toast.error('Supplier name and start date are required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        logo_url: form.logo_url.trim() || null,
      }
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, payload)
        toast.success('Supplier updated successfully!')
      } else {
        await suppliersAPI.create(payload)
        toast.success('Supplier added successfully!')
      }
      setShowModal(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save supplier')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete supplier "${name}"? This cannot be undone.`)) return
    try {
      await suppliersAPI.delete(id)
      toast.success('Supplier deleted successfully')
      fetchSuppliers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete supplier')
    }
  }

  async function handleExportExcel() {
    try {
      const res = await suppliersAPI.list({
        search: search.trim() || undefined,
        per_page: 1000,
        page: 1,
      })
      const data = res.data.suppliers || []
      const columns = ['Supplier Name', 'Contact Person', 'Phone Number', 'Email Address', 'Office Address', 'Supplying Since', 'Added On']
      const rows = data.map((s) => [
        s.name,
        s.contact_person || '—',
        s.phone || '—',
        s.email || '—',
        s.address || '—',
        formatDate(s.started_at),
        formatDateTime(s.created_at),
      ])
      exportToExcel('Suppliers_Report', columns, rows)
      toast.success('Excel export completed!')
    } catch {
      toast.error('Failed to export suppliers')
    }
  }

  return (
    <Layout title="Suppliers">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Compact Search Field */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="supplier-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search suppliers by name or contact…"
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
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Excel Export */}
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5"
              title="Export suppliers to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            {isAdmin && (
              <button
                id="add-supplier-btn"
                onClick={openCreateModal}
                className="btn-primary flex items-center gap-2 text-sm py-2.5"
              >
                <MdAdd size={18} /> Add Supplier
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {total} supplier{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table Container with Sticky Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="suppliers" size="lg" text={t('loadingModule', 'Loading supplier directory…')} />
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={MdLocalShipping}
            title="No suppliers found"
            subtitle={search ? 'Try clearing your search query' : 'Add your first vendor using the button above'}
          />
        ) : (
          <table className="data-table min-w-[850px]">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Contact Information</th>
                <th>Office Address</th>
                <th>Supplying Since</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {/* Supplier Logo / WhatsApp-style DP */}
                      <Avatar
                        src={s.logo_url}
                        name={s.name}
                        size="md"
                        rounded="rounded-xl"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                          {s.name}
                        </p>
                        {s.contact_person && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Attn: {s.contact_person}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    {s.contact_person || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </td>
                  <td>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {s.phone && (
                        <div className="flex items-center gap-1.5">
                          <MdPhone size={13} className="text-slate-400" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center gap-1.5">
                          <MdEmail size={13} className="text-slate-400" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {!s.phone && !s.email && <span className="text-slate-400 dark:text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {s.address ? (
                      <div className="flex items-center gap-1">
                        <MdLocationOn size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MdCalendarToday size={13} className="text-slate-400" />
                      <span>{formatDate(s.started_at)}</span>
                    </div>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Quality & Issue History Button */}
                      <button
                        onClick={() => openQualityModal(s)}
                        title="Supplier Quality & Damage Summary"
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <MdAssessment size={17} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEditModal(s)}
                            title="Edit Supplier"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            title="Delete Supplier"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </>
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

      {/* ── Supplier Quality & Issue Summary Modal ────────────────────────────── */}
      {qualitySupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-3xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
              <div className="flex items-center gap-3">
                <Avatar src={qualitySupplier.logo_url} name={qualitySupplier.name} size="md" rounded="rounded-xl" />
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {qualitySupplier.name} — Quality & Issue History
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vendor Quality Audit • Supplying since {formatDate(qualitySupplier.started_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQualitySupplier(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            {loadingQuality ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading supplier quality metrics…" />
              </div>
            ) : qualityData ? (
              <div className="space-y-5">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-white/10">
                    <p className="text-[11px] text-slate-500 font-medium">Total Purchases</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">{qualityData.total_purchases}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20">
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Total Issues</p>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{qualityData.total_issues}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Damaged Qty</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{qualityData.damaged_quantity} units</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20">
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Pending Issues</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{qualityData.pending_issues}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-white/10 text-center">
                    <p className="text-[10px] text-slate-500">Defective Qty</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{qualityData.defective_quantity} units</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-white/10 text-center">
                    <p className="text-[10px] text-slate-500">Returned Qty</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{qualityData.returned_quantity} units</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-white/10 text-center">
                    <p className="text-[10px] text-slate-500">Replacement Qty</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{qualityData.replacement_quantity} units</p>
                  </div>
                </div>

                {/* Issues Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Recent Supplier Issues & Damage History
                  </h3>
                  {qualityData.recent_issues?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No quality issues reported for this supplier.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
                      <table className="data-table min-w-[650px] text-xs">
                        <thead>
                          <tr>
                            <th>Purchase No</th>
                            <th>Product</th>
                            <th>Issue Type</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Resolution</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityData.recent_issues.map((iss) => (
                            <tr key={iss.id}>
                              <td className="font-mono text-xs font-semibold">{iss.purchase_no}</td>
                              <td>{iss.product_name}</td>
                              <td>
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  {iss.issue_type}
                                </span>
                              </td>
                              <td className="font-bold text-rose-600">{iss.quantity}</td>
                              <td>
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  {iss.status}
                                </span>
                              </td>
                              <td>{iss.resolution || '—'}</td>
                              <td className="text-slate-500">{formatDate(iss.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setQualitySupplier(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Supplier Logo: Click to select from desktop */}
              <ImageUploadPicker
                value={form.logo_url}
                onChange={(newUrl) => setForm({ ...form, logo_url: newUrl })}
                name={form.name || 'Supplier'}
                label="Supplier Logo"
                shape="rounded-2xl"
                size="xl"
                helperText="Click logo or 'Choose from Desktop' to select a logo from your computer."
              />

              <div>
                <label className="form-label">Supplier / Company Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. FreshDairy Co."
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Contact Person</label>
                  <input
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Supplying Since (Start Date) *</label>
                  <input
                    required
                    type="date"
                    value={form.started_at}
                    onChange={(e) => setForm({ ...form, started_at: e.target.value })}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="input-field text-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@supplier.com"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Office Address</label>
                <textarea
                  rows="2"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, State…"
                  className="input-field text-sm resize-none"
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
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 text-sm"
                >
                  {submitting ? 'Saving…' : editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
