'use client'

import { useEffect, useState } from 'react'

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('Testing...')

  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log('🧪 Starting simple fetch test...')
        
        // Test direct fetch to API
        const response = await fetch('http://localhost:3000/api/v1/users')
        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Response data:', data)
        
        setResult(`Success! Got ${data.pagination?.total || 0} users`)
        
      } catch (error) {
        console.error('❌ Fetch error:', error)
        setResult(`Error: ${error.message}`)
      }
    }

    testFetch()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Simple Fetch Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-gray-900 dark:text-white">
            Result: {result}
          </p>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Check the browser console for detailed logs.
        </div>
      </div>
    </div>
  )
}
