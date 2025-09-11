'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { apiClient } from '@/lib/api'
import { WashingMachineBooking, WashingMachineFacility } from '@/types/api'
import { Cog6ToothIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function WashingMachinePage() {
  const [womenBookings, setWomenBookings] = useState<WashingMachineBooking[]>([])
  const [menBookings, setMenBookings] = useState<WashingMachineBooking[]>([])
  const [womenFacilities, setWomenFacilities] = useState<WashingMachineFacility[]>([])
  const [menFacilities, setMenFacilities] = useState<WashingMachineFacility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [womenBookingsRes, menBookingsRes, womenFacilitiesRes, menFacilitiesRes] = await Promise.all([
          apiClient.getWomenWashingMachineBookings({ limit: 10 }),
          apiClient.getMenWashingMachineBookings({ limit: 10 }),
          apiClient.getWomenWashingMachineFacilities(),
          apiClient.getMenWashingMachineFacilities(),
        ])

        setWomenBookings(womenBookingsRes.data)
        setMenBookings(menBookingsRes.data)
        setWomenFacilities(womenFacilitiesRes.data || [])
        setMenFacilities(menFacilitiesRes.data || [])
      } catch (error) {
        console.error('Error fetching washing machine data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Washing Machine Bookings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage washing machine reservations for both men's and women's facilities
          </p>
        </div>

        {/* Facility Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Women's Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-pink-500">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Women's Washing Machines
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {womenFacilities.length} machines available
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="space-y-3 mb-6">
              {womenFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {facility.nama}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Available
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Recent Bookings
              </h3>
              {womenBookings.length > 0 ? (
                <div className="space-y-2">
                  {womenBookings.slice(0, 3).map((booking) => {
                    const startTime = formatDateTime(booking.waktuMulai)
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {booking.peminjam.namaPanggilan}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {startTime.date}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent bookings
                </p>
              )}
            </div>

            <div className="mt-6">
              <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                Book Women's Machine
              </button>
            </div>
          </div>

          {/* Men's Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-blue-500">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Men's Washing Machines
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {menFacilities.length} machines available
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="space-y-3 mb-6">
              {menFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {facility.nama}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Available
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Recent Bookings
              </h3>
              {menBookings.length > 0 ? (
                <div className="space-y-2">
                  {menBookings.slice(0, 3).map((booking) => {
                    const startTime = formatDateTime(booking.waktuMulai)
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {booking.peminjam.namaPanggilan}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {startTime.date}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent bookings
                </p>
              )}
            </div>

            <div className="mt-6">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Book Men's Machine
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Machines</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {womenFacilities.length + menFacilities.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {womenBookings.length + menBookings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available Now</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {womenFacilities.length + menFacilities.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need to do laundry?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Book a washing machine slot to ensure availability. Our system prevents 
              conflicts and helps you plan your laundry schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/users"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Manage Users
              </Link>
              <button className="bg-purple-600 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
