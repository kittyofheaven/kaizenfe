'use client'

import Layout from '@/components/Layout'
import { CubeIcon } from '@heroicons/react/24/outline'

export default function SerbagunaPage() {
  return (
    <Layout>
      <div className="text-center py-16">
        <CubeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Serbaguna Area Booking
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          This section will allow you to book multipurpose areas for various activities.
          The interface will be similar to the communal room booking with area-specific features.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-blue-800 dark:text-blue-200">
            🚧 Coming Soon - This feature is under development
          </p>
        </div>
      </div>
    </Layout>
  )
}
