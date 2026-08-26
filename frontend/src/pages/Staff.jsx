import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdSearch, MdClose, MdPeople, MdEdit, MdDeleteOutline,
  MdFileDownload, MdShield
} from 'react-icons/md'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Avatar from '../components/Avatar'
import ImageUploadPicker from '../components/ImageUploadPicker'
import { staffAPI } from '../services/api'
import { exportToExcel } from '../utils/excelExport'
import { formatDateTime } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff', avatar_url: '' }

export default function Staff() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const currentRole = user?.role
  const isAdmin = currentRole === 'admin'

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await staffAPI.list()
      setUsers(res.data.users || [])
    } catch {
      toast.error('Failed to load user accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  })

  function openCreateModal() {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(u) {
    setEditingUser(u)
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'staff',
      avatar_url: u.avatar_url || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          avatar_url: form.avatar_url.trim() || null,
        }
        if (form.password.trim()) payload.password = form.password
        await staffAPI.update(editingUser.id, payload)
        toast.success('User updated successfully!')
      } else {
        if (!form.password.trim()) {
          toast.error('Password is required for new accounts')
          setSubmitting(false)
          return
        }
        await staffAPI.create({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          avatar_url: form.avatar_url.trim() || null,
        })
        toast.success('User created successfully!')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return
    try {
      await staffAPI.delete(id)
      toast.success(`User "${name}" deleted`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    }
  }

  function handleExportExcel() {
    const columns = ['Staff Name', 'Email Address', 'System Role', 'Account Created At']
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.role.toUpperCase(),
      formatDateTime(u.created_at),
    ])
    exportToExcel('Staff_Users_Report', columns, rows)
    toast.success('Excel export completed!')
  }

  return (
    <Layout title="Staff Management">
      {/* Action Toolbar */}
      <div className="pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Compact Search */}
            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="staff-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff by name, email, role…"
                className="input-field pl-10 pr-8 w-full text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
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
              title="Export staff users to Excel"
            >
              <MdFileDownload size={18} /> Export Excel
            </button>

            <button
              id="add-staff-btn"
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 text-sm py-2.5"
            >
              <MdAdd size={18} /> Add User
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {filteredUsers.length} user account{filteredUsers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Horizontally & Vertically Scrollable Table Container with Sticky Field Names */}
      <div className="glass-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] w-full mt-2 border border-slate-200 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner module="staff" size="lg" text={t('loadingModule', 'Loading staff members…')} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={MdPeople}
            title="No users found"
            subtitle={search ? 'Try a different search keyword' : 'Create user accounts using the button above'}
          />
        ) : (
          <table className="data-table min-w-[700px]">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Account Created At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === user?.id
                const canEditThisUser = isAdmin || (currentRole === 'manager' && u.role === 'staff')
                const canDeleteThisUser = isAdmin && !isSelf

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {/* Profile Picture / WhatsApp-style DP */}
                        <Avatar
                          src={u.avatar_url}
                          name={u.name}
                          size="md"
                          rounded="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">{u.name}</p>
                          {isSelf && <span className="text-[10px] text-indigo-500 font-medium">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 text-sm">
                      {u.email}
                    </td>
                    <td>
                      <span className={`
                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' : ''}
                        ${u.role === 'manager' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' : ''}
                        ${u.role === 'staff' ? 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30' : ''}
                      `}>
                        <MdShield size={12} /> {u.role}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditThisUser && (
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit User"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {canDeleteThisUser && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            title="Delete User"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingUser ? 'Edit User Account' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture: Click to select from desktop */}
              <ImageUploadPicker
                value={form.avatar_url}
                onChange={(newUrl) => setForm({ ...form, avatar_url: newUrl })}
                name={form.name || 'User'}
                label="Profile Picture"
                shape="rounded-full"
                size="xl"
                helperText="Click picture or 'Choose from Desktop' to select a photo from your computer."
              />

              <div>
                <label className="form-label">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="priya@ims.com"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="form-label">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Enter strong password'}
                  className="input-field text-sm"
                  minLength={6}
                />
              </div>

              {/* Role selection */}
              <div>
                <label className="form-label">System Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="select-field text-sm"
                  disabled={!isAdmin && currentRole === 'manager'}
                >
                  <option value="staff">Staff</option>
                  {isAdmin && <option value="manager">Manager</option>}
                  {isAdmin && <option value="admin">Admin</option>}
                </select>
                {!isAdmin && currentRole === 'manager' && (
                  <p className="text-[11px] text-slate-400 mt-1">Managers can only create and manage Staff accounts.</p>
                )}
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
                  {submitting ? 'Saving…' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
