'use client'

import Layout from '@/components/Layout'
import { FireIcon } from '@heroicons/react/24/outline'

export default function KitchenPage() {
  return (
    <Layout>
      <div className="text-center py-16">
        <FireIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Kitchen Booking
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          This section will allow you to book kitchen facilities including stoves, microwaves,
          and other cooking equipment. You'll also be able to borrow additional equipment.
        </p>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-orange-800 dark:text-orange-200">
            🚧 Coming Soon - This feature is under development
          </p>
        </div>
      </div>
    </Layout>
  )
}
