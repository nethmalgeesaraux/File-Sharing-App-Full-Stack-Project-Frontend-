import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-4 text-sm text-gray-700">
        Dashboard content
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
