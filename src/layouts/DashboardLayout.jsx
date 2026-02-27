import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    label: 'Upload',
    to: '/upload',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
      </svg>
    )
  },
  {
    label: 'My Files',
    to: '/my-files',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
      </svg>
    )
  },
  {
    label: 'Subscription',
    to: '/subscription',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M2 10h20" />
      </svg>
    )
  },
  {
    label: 'Transactions',
    to: '/transactions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 2v20" />
        <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
      </svg>
    )
  }
]

const DashboardLayout = ({ children }) => {
  const location = useLocation()
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-[#f6f6fa]">
      <div className="flex min-h-screen">
        <aside className="w-[240px] border-r border-gray-200 bg-white px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 px-2">
            <span className="text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="6" r="2" />
                <circle cx="18" cy="18" r="2" />
                <path d="M8 12h8" />
                <path d="M16.5 7.2 8 11" />
                <path d="M16.5 16.8 8 13" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900">DropZone</span>
          </Link>

          <div className="mt-10 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-violet-600 to-blue-500 text-2xl font-semibold text-white">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">
              {user?.fullName || user?.firstName || 'User'}
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'border-violet-700 bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white shadow-sm'
                      : 'border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-14 items-center justify-end border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                5 Credits
              </div>
              <UserButton />
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
