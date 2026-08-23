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
import { dashboardAPI } from '../services/api'
import { formatDateTime } from '../utils/formatDate'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
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
      setStats(res.data)
    } catch {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoadingStats(false)
    }
  }

  async function fetchTransactions() {
    try {
      const res = await dashboardAPI.transactions({ per_page: 10 })
      setTxns(res.data.transactions || [])
    } catch {
      toast.error('Failed to load transactions')
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
      const d = new Date(t.transaction_date)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (days[key]) {
        days[key][t.type] += t.quantity
      }
    })
    return Object.values(days)
  })()

  return (
    <Layout title="Dashboard">
      {/* Stat cards — Clickable redirection to respective modules */}
      {loadingStats ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading stats…" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Active Products"
            value={stats?.total_products}
            icon={MdInventory}
            color="indigo"
            subtitle="Click to view all products"
            to="/products"
          />
          <StatCard
            title="Total Stock on Hand"
            value={stats?.total_stock}
            icon={MdTrendingUp}
            color="emerald"
            subtitle="Click to view stock inventory"
            to="/inventory"
          />
          <StatCard
            title="Low Stock Alerts"
            value={stats?.low_stock_count}
            icon={MdWarning}
            color={stats?.low_stock_count > 0 ? 'rose' : 'emerald'}
            subtitle={stats?.low_stock_count > 0 ? 'Click to view low stock items' : 'All products adequately stocked'}
            to="/inventory?status=low"
          />
        </div>
      )}

      {/* Chart */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
          Stock Movement — Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-slate-500" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="text-slate-500" axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(23, 23, 37, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 12,
                color: '#fff'
              }}
            />
            <Area type="monotone" dataKey="IN" stroke="#6366f1" strokeWidth={2} fill="url(#colorIn)" name="Stock In" />
            <Area type="monotone" dataKey="OUT" stroke="#f43f5e" strokeWidth={2} fill="url(#colorOut)" name="Stock Out" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
          Recent Transactions
        </h2>
        {loadingTxns ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : txns.length === 0 ? (
          <EmptyState
            icon={MdShoppingCart}
            title="No transactions yet"
            subtitle="Purchases and orders will appear here"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Transaction Type</th>
                  <th>Quantity</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.product_name}
                    </td>
                    <td className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {t.sku}
                    </td>
                    <td>
                      {t.type === 'IN' ? (
                        <span className="badge-green flex items-center gap-1 w-fit">
                          <MdArrowUpward size={12} /> IN
                        </span>
                      ) : (
                        <span className="badge-red flex items-center gap-1 w-fit">
                          <MdArrowDownward size={12} /> OUT
                        </span>
                      )}
                    </td>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">
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
