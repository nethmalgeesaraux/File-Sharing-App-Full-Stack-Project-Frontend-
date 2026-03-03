import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Link } from 'react-router-dom'
import { Upload, FolderOpen, CreditCard, ReceiptText, ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const Dashboard = () => {
  const { getToken } = useAuth()
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsData, setStatsData] = useState({
    totalFiles: 0,
    remainingCredits: 0,
    totalUploads: 0,
    transactions: 0,
  })

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const filesEndpoint = import.meta.env.VITE_MY_FILES_ENDPOINT || '/api/files'
  const creditsEndpoint = import.meta.env.VITE_CREDITS_ENDPOINT || '/api/credits'
  const transactionsEndpoint = import.meta.env.VITE_TRANSACTIONS_ENDPOINT || '/api/transactions'
  const dashboardStatsEndpoint = import.meta.env.VITE_DASHBOARD_STATS_ENDPOINT || ''

  const extractList = (payload) => {
    const source =
      payload?.files ||
      payload?.transactions ||
      payload?.data?.files ||
      payload?.data?.transactions ||
      payload?.data ||
      payload?.results ||
      payload
    return Array.isArray(source) ? source : []
  }

  const extractCredits = (payload) =>
    Number(
      payload?.remainingCredits ??
      payload?.creditsRemaining ??
      payload?.credits ??
      payload?.data?.remainingCredits ??
      payload?.data?.creditsRemaining ??
      0
    )

  useEffect(() => {
    const controller = new AbortController()

    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        const token = await getToken()
        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        if (dashboardStatsEndpoint) {
          const dashboardRes = await fetch(`${apiBaseUrl}${dashboardStatsEndpoint}`, {
            method: 'GET',
            headers,
            signal: controller.signal,
          })
          if (dashboardRes.ok) {
            const dashboardData = await dashboardRes.json()
            setStatsData({
              totalFiles: Number(dashboardData?.totalFiles ?? dashboardData?.data?.totalFiles ?? 0),
              remainingCredits: Number(
                dashboardData?.remainingCredits ?? dashboardData?.data?.remainingCredits ?? 0
              ),
              totalUploads: Number(dashboardData?.totalUploads ?? dashboardData?.data?.totalUploads ?? 0),
              transactions: Number(
                dashboardData?.transactions ?? dashboardData?.data?.transactions ?? 0
              ),
            })
            return
          }
        }

        const [filesRes, creditsRes, transactionsRes] = await Promise.all([
          fetch(`${apiBaseUrl}${filesEndpoint}`, { method: 'GET', headers, signal: controller.signal }),
          fetch(`${apiBaseUrl}${creditsEndpoint}`, { method: 'GET', headers, signal: controller.signal }),
          fetch(`${apiBaseUrl}${transactionsEndpoint}`, { method: 'GET', headers, signal: controller.signal }),
        ])

        const [filesData, creditsData, transactionsData] = await Promise.all([
          filesRes.ok ? filesRes.json() : Promise.resolve(null),
          creditsRes.ok ? creditsRes.json() : Promise.resolve(null),
          transactionsRes.ok ? transactionsRes.json() : Promise.resolve(null),
        ])

        const files = extractList(filesData)
        const transactions = extractList(transactionsData)
        const remainingCredits = extractCredits(creditsData)

        setStatsData({
          totalFiles: files.length,
          remainingCredits: Number.isFinite(remainingCredits) ? remainingCredits : 0,
          totalUploads: files.length,
          transactions: transactions.length,
        })
      } catch {
        setStatsData({
          totalFiles: 0,
          remainingCredits: 0,
          totalUploads: 0,
          transactions: 0,
        })
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStats(false)
        }
      }
    }

    fetchStats()
    return () => controller.abort()
  }, [apiBaseUrl, creditsEndpoint, dashboardStatsEndpoint, filesEndpoint, getToken, transactionsEndpoint])

  const stats = useMemo(
    () => [
      { label: 'Total Files', value: statsData.totalFiles, icon: FolderOpen, tone: 'text-blue-600 bg-blue-50' },
      { label: 'Remaining Credits', value: statsData.remainingCredits, icon: CreditCard, tone: 'text-violet-600 bg-violet-50' },
      { label: 'Total Uploads', value: statsData.totalUploads, icon: Upload, tone: 'text-emerald-600 bg-emerald-50' },
      { label: 'Transactions', value: statsData.transactions, icon: ReceiptText, tone: 'text-amber-600 bg-amber-50' },
    ],
    [statsData]
  )

  const recentActivities = [
    { id: 1, title: 'Super thanks.png uploaded', time: '2 minutes ago', status: 'done' },
    { id: 2, title: 'Credits purchased (Pro plan)', time: '1 day ago', status: 'done' },
    { id: 3, title: 'Share link generated for report.csv', time: '3 days ago', status: 'pending' },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage uploads, files, credits, and payments from one place.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Link>
            <Link
              to="/my-files"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FolderOpen className="h-4 w-4" />
              My Files
            </Link>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                  <item.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{loadingStats ? '...' : item.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to="/subscription"
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Buy Credits
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </Link>
              <Link
                to="/transactions"
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                View Transactions
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </Link>
              <Link
                to="/my-files"
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Share Files
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </Link>
              <Link
                to="/upload"
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                New Upload
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </Link>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <ul className="mt-4 space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    {activity.status === 'done' ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    ) : (
                      <Clock3 className="mt-0.5 h-4 w-4 text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
