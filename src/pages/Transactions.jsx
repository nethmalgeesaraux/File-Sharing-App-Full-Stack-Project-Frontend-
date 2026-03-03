import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '@clerk/clerk-react'
import { ReceiptText, Coins, BadgeDollarSign } from 'lucide-react'

const Transactions = () => {
  const { getToken } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const transactionsEndpoint = import.meta.env.VITE_TRANSACTIONS_ENDPOINT || '/api/transactions'

  const normalizeTransactions = (payload) => {
    const source =
      payload?.transactions || payload?.data?.transactions || payload?.data || payload?.results || payload
    const list = Array.isArray(source) ? source : []

    return list.map((item, index) => ({
      id: item.id || item._id || item.transactionId || `txn-${index}`,
      date: item.date || item.createdAt || item.paidAt || null,
      amount: Number(item.amount ?? item.price ?? item.total ?? 0),
      credits: Number(item.credits ?? item.creditAmount ?? item.creditCount ?? 0),
      status: item.status || item.paymentStatus || 'completed',
      method: item.method || item.paymentMethod || 'Card',
      reference: item.reference || item.ref || item.invoiceId || item.sessionId || '-',
    }))
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('en-GB')
  }

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  useEffect(() => {
    const controller = new AbortController()

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError('')
        const token = await getToken()
        const response = await fetch(`${apiBaseUrl}${transactionsEndpoint}`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions (${response.status})`)
        }

        const data = await response.json()
        setTransactions(normalizeTransactions(data))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setTransactions([])
          setError('Could not load transactions from backend.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchTransactions()

    return () => controller.abort()
  }, [apiBaseUrl, getToken, transactionsEndpoint])

  const summary = useMemo(() => {
    const totalSpent = transactions.reduce((sum, item) => sum + item.amount, 0)
    const totalCredits = transactions.reduce((sum, item) => sum + item.credits, 0)
    const successfulCount = transactions.filter(
      (item) => String(item.status).toLowerCase() === 'completed' || String(item.status).toLowerCase() === 'paid'
    ).length

    return { totalSpent, totalCredits, successfulCount }
  }, [transactions])

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-600">All payment and credit purchase history.</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Spent</p>
            <div className="mt-2 flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSpent)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Credits Purchased</p>
            <div className="mt-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-violet-600" />
              <p className="text-2xl font-bold text-gray-900">{summary.totalCredits}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Successful Payments</p>
            <div className="mt-2 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">{summary.successfulCount}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-sm text-gray-500 shadow-sm">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-sm text-gray-600 shadow-sm">
            No transactions found yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => {
                  const status = String(item.status).toLowerCase()
                  const statusClass =
                    status === 'completed' || status === 'paid'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'

                  return (
                    <tr key={item.id} className="border-b border-gray-100 text-sm text-gray-700 last:border-b-0">
                      <td className="px-6 py-4">{formatDate(item.date)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      <td className="px-6 py-4">{item.credits}</td>
                      <td className="px-6 py-4">{item.method}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{item.reference}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Transactions
