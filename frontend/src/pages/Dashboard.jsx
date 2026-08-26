import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  MdInventory, MdShoppingCart, MdWarning, MdTrendingUp,
  MdArrowUpward, MdArrowDownward
} from 'react-icons/md'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useLanguage } from '../context/LanguageContext'
import { dashboardAPI } from '../services/api'
import { formatDateTime } from '../utils/formatDate'

export default function Dashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState({ total_products: 0, total_stock: 0, low_stock_count: 0 })
  const [txns, setTxns] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTxns, setLoadingTxns] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchTransactions()
  }, [])

  async function fetchStats() {
    try {
      const res = await dashboardAPI.stats()
      if (res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  async function fetchTransactions() {
    try {
      const res = await dashboardAPI.transactions({ per_page: 15 })
      if (res.data && Array.isArray(res.data.transactions)) {
        setTxns(res.data.transactions)
      }
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoadingTxns(false)
    }
  }

  // Build chart data: last 7 days of IN/OUT
  const chartData = (() => {
    const days = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      days[key] = { name: key, IN: 0, OUT: 0 }
    }
    txns.forEach((t) => {
      if (!t.transaction_date) return
      const d = new Date(t.transaction_date)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (days[key]) {
        days[key][t.type] += Number(t.quantity || 0)
      }
    })
    return Object.values(days)
  })()

  return (
    <Layout title={t('dashboard', 'Dashboard')}>
      {/* Stat cards — Clickable redirection to respective modules with Flaticon animated icons */}
      {loadingStats ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner module="dashboard" size="lg" text={t('loadingModule', 'Loading dashboard analytics…')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title={t('totalActiveProducts', 'Total Active Products')}
            value={stats.total_products}
            module="products"
            color="indigo"
            subtitle="Click to view all products"
            to="/products"
          />
          <StatCard
            title={t('stockOnHand', 'Total Stock on Hand')}
            value={stats.total_stock}
            module="inventory"
            color="emerald"
            subtitle="Click to view stock inventory"
            to="/inventory"
          />
          <StatCard
            title={t('lowStockAlerts', 'Low Stock Alerts')}
            value={stats.low_stock_count}
            module="damages"
            color={stats.low_stock_count > 0 ? 'rose' : 'emerald'}
            subtitle={stats.low_stock_count > 0 ? 'Click to view low stock items' : 'All products adequately stocked'}
            to="/inventory?status=low"
          />
        </div>
      )}

      {/* Chart */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            Stock Movement — Last 7 Days
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Stock In (Purchases)
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Stock Out (Orders)
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 12,
                color: '#fff'
              }}
            />
            <Area type="monotone" dataKey="IN" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorIn)" name="Stock In" />
            <Area type="monotone" dataKey="OUT" stroke="#f43f5e" strokeWidth={2.5} fill="url(#colorOut)" name="Stock Out" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
          Recent In & Out Stock Products
        </h2>
        {loadingTxns ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner module="dashboard" size="md" text="Loading recent in & out products…" />
          </div>
        ) : txns.length === 0 ? (
          <EmptyState
            icon={MdShoppingCart}
            title="No recent in/out transactions"
            subtitle="Record stock purchases or place customer orders to see live movement"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t, idx) => (
                  <tr key={t.id ? `${t.id}-${idx}` : idx}>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.product_name || '—'}
                    </td>
                    <td className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {t.sku || '—'}
                    </td>
                    <td>
                      {t.type === 'IN' ? (
                        <span className="badge-green flex items-center gap-1 w-fit font-bold">
                          <MdArrowUpward size={14} /> Stock In
                        </span>
                      ) : (
                        <span className="badge-red flex items-center gap-1 w-fit font-bold">
                          <MdArrowDownward size={14} /> Stock Out
                        </span>
                      )}
                    </td>
                    <td className="font-bold text-slate-800 dark:text-slate-200">
                      {t.quantity}
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(t.transaction_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
