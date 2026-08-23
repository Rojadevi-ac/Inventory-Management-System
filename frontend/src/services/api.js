import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ims_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ims_token')
      localStorage.removeItem('ims_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/auth/login', data),
  profile: ()     => api.get('/auth/profile'),
}

// ── Staff Management ──────────────────────────────────────────────────────────
export const staffAPI = {
  list:   ()           => api.get('/auth/users'),
  create: (data)       => api.post('/auth/users', data),
  update: (id, data)   => api.put(`/auth/users/${id}`, data),
  delete: (id)         => api.delete(`/auth/users/${id}`),
}

// ── Categories ───────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list:   (params)     => api.get('/categories', { params }),
  active: ()           => api.get('/categories/active'),
  create: (data)       => api.post('/categories', data),
  update: (id, data)   => api.put(`/categories/${id}`, data),
  delete: (id)         => api.delete(`/categories/${id}`),
}

// ── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list:       (params) => api.get('/products', { params }),
  get:        (id)     => api.get(`/products/${id}`),
  create:     (data)   => api.post('/products', data),
  update:     (id, data) => api.put(`/products/${id}`, data),
  delete:     (id)     => api.delete(`/products/${id}`),
  restore:    (id)     => api.put(`/products/${id}/restore`),
  categories: ()       => api.get('/products/categories'),
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  list:          (params)           => api.get('/inventory', { params }),
  updateReorder: (productId, level) => api.put(`/inventory/${productId}/reorder`, { reorder_level: level }),
}

// ── Purchases ────────────────────────────────────────────────────────────────
export const purchasesAPI = {
  list:   (params) => api.get('/purchases', { params }),
  create: (data)   => api.post('/purchases', data),
}

// ── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list:   (params) => api.get('/orders', { params }),
  create: (data)   => api.post('/orders', data),
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats:        ()       => api.get('/dashboard'),
  transactions: (params) => api.get('/dashboard/transactions', { params }),
}

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliersAPI = {
  list:   (params) => api.get('/suppliers', { params }),
  get:    (id)     => api.get(`/suppliers/${id}`),
  create: (data)   => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id)     => api.delete(`/suppliers/${id}`),
}

// ── Audit Logs History ────────────────────────────────────────────────────────
export const logsAPI = {
  list:       (params)           => api.get('/logs', { params }),
  forProduct: (productId, params) => api.get(`/logs/products/${productId}`, { params }),
}

// ── Supplier Issues & Damages ─────────────────────────────────────────────────
export const supplierIssuesAPI = {
  list:             (params) => api.get('/supplier-issues', { params }),
  create:           (data)   => api.post('/supplier-issues', data),
  updateStatus:     (id, data) => api.put(`/supplier-issues/${id}/status`, data),
  getPurchases:     (supplierId) => api.get(`/supplier-issues/supplier/${supplierId}/purchases`),
  getDamageSummary: (purchaseId, productId) => api.get('/supplier-issues/damage-summary', { params: { purchase_id: purchaseId, product_id: productId } }),
  getQualitySummary:(supplierId) => api.get(`/supplier-issues/supplier/${supplierId}/quality`),
}

export default api
