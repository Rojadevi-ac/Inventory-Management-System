import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { dashboardAPI } from '../services/api'
import { formatDateTime } from '../utils/formatDate'
import { useLanguage } from '../context/LanguageContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MdTrendingUp, MdSwapVert } from 'react-icons/md'

export default function Dashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    total_products: 0,
    total_stock: 0,
    low_stock_count: 0,
  })
  const [txns, setTxns] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTxns, setLoadingTxns] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardAPI.stats()
      setStats(res.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await dashboardAPI.transactions({ per_page: 50 })
      if (res.data && Array.isArray(res.data.transactions)) {
        setTxns(res.data.transactions)
      }
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoadingTxns(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchTransactions()
  }, [fetchStats, fetchTransactions])

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
      let str = String(t.transaction_date).trim()
      if (str.includes(' ') && !str.includes('T')) {
        str = str.replace(' ', 'T')
      }
      const d = new Date(str)
      if (isNaN(d.getTime())) return
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const typeKey = String(t.type || '').toUpperCase() === 'IN' ? 'IN' : 'OUT'
      if (days[key]) {
        days[key][typeKey] = (days[key][typeKey] || 0) + Number(t.quantity || 0)
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

      {/* Chart Section */}
      <div className="glass-card p-5 mb-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdTrendingUp className="text-indigo-500" size={20} />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              {t('stockMovementTrend', 'Stock Movement (Last 7 Days)')}
            </h2>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t('inboundOutboundActivity', 'Inbound & Outbound Activity')}
          </span>
        </div>

        <div className="h-64 w-full">
          {loadingTxns ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="md" text={t('loadingModule', 'Loading chart data…')} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="IN" name={t('stockInbound', 'Stock IN')} stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="OUT" name={t('stockOutbound', 'Stock OUT')} stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdSwapVert className="text-indigo-500" size={20} />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              {t('recentStockTransactions', 'Recent In & Out Stock Products')}
            </h2>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t('latestAuditTrail', 'Latest 15 transactions across all products')}
          </span>
        </div>

        {loadingTxns ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" text={t('loadingModule', 'Loading transactions…')} />
          </div>
        ) : txns.length === 0 ? (
          <EmptyState
            title={t('noTransactionsFound', 'No recent transactions found')}
            subtitle={t('noTransactionsSub', 'Stock movements will appear here when purchases or orders take place')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="pb-3 px-2">{t('type', 'Type')}</th>
                  <th className="pb-3 px-2">{t('product', 'Product')}</th>
                  <th className="pb-3 px-2">{t('sku', 'SKU')}</th>
                  <th className="pb-3 px-2 text-right">{t('quantity', 'Quantity')}</th>
                  <th className="pb-3 px-2 text-right">{t('dateTime', 'Date & Time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {txns.slice(0, 15).map((txn) => {
                  const isIn = String(txn.type || '').toUpperCase() === 'IN'
                  return (
                    <tr key={`${txn.type}-${txn.id}-${txn.transaction_date}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${isIn ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                          {isIn ? t('stockIn', 'IN') : t('stockOut', 'OUT')}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">
                        {txn.product_name || 'Product Item'}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-400">
                        {txn.sku || 'N/A'}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-bold font-mono ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIn ? '+' : '-'}{txn.quantity}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(txn.transaction_date)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
