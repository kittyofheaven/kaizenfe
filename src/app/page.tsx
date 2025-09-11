'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { apiClient } from '@/lib/api'
import {
  BuildingOfficeIcon,
  CubeIcon,
  FireIcon,
  Cog6ToothIcon,
  UsersIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalUsers: number
  totalBookings: number
  todayBookings: number
  availableSlots: number
}

const facilityCards = [
  {
    name: 'Users Management',
    description: 'Manage user accounts and profiles',
    href: '/users',
    icon: UsersIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Communal Room',
    description: 'Book communal meeting rooms',
    href: '/communal',
    icon: BuildingOfficeIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Serbaguna Area',
    description: 'Reserve multipurpose areas',
    href: '/serbaguna',
    icon: CubeIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Kitchen',
    description: 'Book kitchen facilities',
    href: '/kitchen',
    icon: FireIcon,
    color: 'bg-orange-500',
  },
  {
    name: 'Washing Machine',
    description: 'Reserve washing machines',
    href: '/washing-machine',
    icon: Cog6ToothIcon,
    color: 'bg-indigo-500',
  },
]

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    todayBookings: 0,
    availableSlots: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🚀 Starting to fetch dashboard stats...')
        
        // Fetch basic stats
        console.log('📊 Fetching users...')
        const usersResponse = await apiClient.getUsers()
        console.log('✅ Users response:', usersResponse)
        
        console.log('🏢 Fetching communal bookings...')
        const communalResponse = await apiClient.getCommunalBookings()
        console.log('✅ Communal response:', communalResponse)
        
        const newStats = {
          totalUsers: usersResponse.pagination?.total || 0,
          totalBookings: communalResponse.pagination?.total || 0,
          todayBookings: 0, // Would need to filter by today
          availableSlots: 16, // Default slots per day
        }
        
        console.log('📈 Setting stats:', newStats)
        setStats(newStats)
      } catch (error) {
        console.error('❌ Error fetching stats:', error)
        // Set some default values even on error
        setStats({
          totalUsers: 0,
          totalBookings: 0,
          todayBookings: 0,
          availableSlots: 0,
        })
      } finally {
        console.log('🏁 Finished loading stats')
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Kaizen
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive facility booking system for communal rooms, multipurpose areas, 
            kitchen facilities, and washing machines.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.todayBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available Slots</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.availableSlots}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Facility Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilityCards.map((facility) => (
              <Link
                key={facility.name}
                href={facility.href}
                className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${facility.color}`}>
                    <facility.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {facility.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {facility.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Choose a facility to manage or create new bookings. Our system ensures 
              efficient scheduling and prevents double bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/users"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Manage Users
              </Link>
              <Link
                href="/communal"
                className="bg-blue-600 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Book Facility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
