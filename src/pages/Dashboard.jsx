import React from 'react'
import { UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your account and file sharing activity</p>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Cloud Share</h2>
          <p className="mt-2 max-w-2xl text-gray-600">
            From here, you can upload new files, manage your existing files, and view your sharing activity.
          </p>

          <div className="mt-6">
            <Link
              to="/upload"
              className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Go to Upload
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
