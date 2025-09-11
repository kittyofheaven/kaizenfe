'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      const testResults: any[] = []
      
      try {
        // Test 1: Health check
        console.log('Testing health...')
        const health = await apiClient.getHealth()
        testResults.push({ name: 'Health Check', success: true, data: health })
        console.log('Health result:', health)
      } catch (error) {
        testResults.push({ name: 'Health Check', success: false, error: error.message })
        console.error('Health error:', error)
      }

      try {
        // Test 2: API Info
        console.log('Testing API info...')
        const apiInfo = await apiClient.getApiInfo()
        testResults.push({ name: 'API Info', success: true, data: apiInfo })
        console.log('API Info result:', apiInfo)
      } catch (error) {
        testResults.push({ name: 'API Info', success: false, error: error.message })
        console.error('API Info error:', error)
      }

      try {
        // Test 3: Users
        console.log('Testing users...')
        const users = await apiClient.getUsers()
        testResults.push({ name: 'Users', success: true, data: users })
        console.log('Users result:', users)
      } catch (error) {
        testResults.push({ name: 'Users', success: false, error: error.message })
        console.error('Users error:', error)
      }

      try {
        // Test 4: Women Washing Machine Facilities
        console.log('Testing women washing machine facilities...')
        const womenFacilities = await apiClient.getWomenWashingMachineFacilities()
        testResults.push({ name: 'Women WM Facilities', success: true, data: womenFacilities })
        console.log('Women facilities result:', womenFacilities)
      } catch (error) {
        testResults.push({ name: 'Women WM Facilities', success: false, error: error.message })
        console.error('Women facilities error:', error)
      }

      setResults(testResults)
      setLoading(false)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          API Debug Page
        </h1>
        
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Running tests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-3 ${
                      result.success ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {result.name}
                  </h3>
                </div>
                
                {result.success ? (
                  <div className="ml-6">
                    <p className="text-green-700 dark:text-green-300 mb-2">✅ Success</p>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="ml-6">
                    <p className="text-red-700 dark:text-red-300 mb-2">❌ Failed</p>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Error: {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
