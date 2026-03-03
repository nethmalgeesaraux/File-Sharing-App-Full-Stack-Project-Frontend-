import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { List, LayoutGrid } from 'lucide-react'

const MyFiles = () => {
  const files = []

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold leading-none tracking-tight text-gray-900 sm:text-[42px]">
              My Files
            </h1>
            <span className="inline-flex min-w-9 items-center justify-center rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 px-3 py-1 text-sm font-semibold text-violet-700 shadow-sm">
              {files.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded text-blue-600 transition hover:bg-blue-50"
              aria-label="List view"
            >
              <List className="h-5 w-5" strokeWidth={2.4} />
            </button>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyFiles
