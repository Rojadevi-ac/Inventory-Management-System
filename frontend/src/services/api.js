import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ims_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

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

// In-memory cache for fast dropdown lookups
const cache = new Map()
const CACHE_TTL = 15000 // 15 seconds

async function cachedGet(url, params = {}) {
  const cacheKey = `${url}?${JSON.stringify(params)}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const response = await api.get(url, { params })
  cache.set(cacheKey, { timestamp: Date.now(), data: response })
  return response
}

export function clearAPICache() {
  cache.clear()
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),

  register: (data) => api.post('/auth/register', data),

  profile: () => api.get('/auth/profile'),
}

// ── Staff Management ─────────────────────────────────────────────────────────
export const staffAPI = {
  list: () =>
    api.get('/staff').catch((err) => (err.response?.status === 404 ? api.get('/auth/users') : Promise.reject(err))),

  create: (data) => {
    clearAPICache()
    return api.post('/staff', data).catch((err) => (err.response?.status === 404 ? api.post('/auth/users', data) : Promise.reject(err)))
  },

  update: (id, data) => {
    clearAPICache()
    return api.put(`/staff/${id}`, data).catch((err) => (err.response?.status === 404 ? api.put(`/auth/users/${id}`, data) : Promise.reject(err)))
  },

  delete: (id) => {
    clearAPICache()
    return api.delete(`/staff/${id}`).catch((err) => (err.response?.status === 404 ? api.delete(`/auth/users/${id}`) : Promise.reject(err)))
  },
}

// ── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params) => api.get('/products', { params }),

  get: (id) => api.get(`/products/${id}`),

  create: (data) => { clearAPICache(); return api.post('/products', data) },

  update: (id, data) => { clearAPICache(); return api.put(`/products/${id}`, data) },

  delete: (id) => { clearAPICache(); return api.delete(`/products/${id}`) },

  restore: (id) => { clearAPICache(); return api.post(`/products/${id}/restore`) },

  archived: (params) => api.get('/products/archived', { params }),
}

// ── Categories ───────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: (params) => api.get('/categories', { params }),

  getActive: () => cachedGet('/categories/active'),

  active: () => cachedGet('/categories/active'),

  create: (data) => { clearAPICache(); return api.post('/categories', data) },

  update: (id, data) => { clearAPICache(); return api.put(`/categories/${id}`, data) },

  delete: (id) => { clearAPICache(); return api.delete(`/categories/${id}`) },
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  list: (params) => api.get('/inventory', { params }),

  updateReorder: (productId, level) =>
    api.put(`/inventory/${productId}/reorder`, {
      reorder_level: level,
    }),
}

// ── Purchases ────────────────────────────────────────────────────────────────
export const purchasesAPI = {
  list: (params) => api.get('/purchases', { params }),

  create: (data) => { clearAPICache(); return api.post('/purchases', data) },
}

// ── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),

  create: (data) => { clearAPICache(); return api.post('/orders', data) },
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard'),

  transactions: (params) =>
    api.get('/dashboard/transactions', { params }),
}

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliersAPI = {
  list: (params) => cachedGet('/suppliers', params),

  get: (id) => api.get(`/suppliers/${id}`),

  create: (data) => { clearAPICache(); return api.post('/suppliers', data) },

  update: (id, data) => { clearAPICache(); return api.put(`/suppliers/${id}`, data) },

  delete: (id) => { clearAPICache(); return api.delete(`/suppliers/${id}`) },
}

// ── Audit Logs History ────────────────────────────────────────────────────────
export const logsAPI = {
  list: (params) => api.get('/logs', { params }),

  forProduct: (productId, params) =>
    api.get(`/logs/products/${productId}`, { params }),
}

// ── Supplier Issues & Damages ─────────────────────────────────────────────────
export const supplierIssuesAPI = {
  list: (params) => api.get('/supplier-issues', { params }),

  create: (data) => { clearAPICache(); return api.post('/supplier-issues', data) },

  updateStatus: (id, data) =>
    { clearAPICache(); return api.put(`/supplier-issues/${id}/status`, data) },

  getPurchases: (supplierId) =>
    cachedGet(`/supplier-issues/supplier/${supplierId}/purchases`),

  getDamageSummary: (purchaseId, productId) =>
    api.get('/supplier-issues/damage-summary', {
      params: {
        purchase_id: purchaseId,
        product_id: productId,
      },
    }),

  getQualitySummary: (supplierId) =>
    cachedGet(`/supplier-issues/supplier/${supplierId}/quality`),
}