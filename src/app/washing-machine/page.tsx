'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import WashingMachineLayout from '@/components/WashingMachineLayout'
import { apiClient } from '@/lib/api'
import { WashingMachineBooking, WashingMachineFacility } from '@/types/api'
import { Cog6ToothIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function WashingMachinePage() {
  const [womenBookings, setWomenBookings] = useState<WashingMachineBooking[]>([])
  const [menBookings, setMenBookings] = useState<WashingMachineBooking[]>([])
  const [womenFacilities, setWomenFacilities] = useState<WashingMachineFacility[]>([])
  const [menFacilities, setMenFacilities] = useState<WashingMachineFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [womenBookingsRes, menBookingsRes, womenFacilitiesRes, menFacilitiesRes] = await Promise.all([
          apiClient.getWomenWashingMachineBookings({ limit: 50 }),
          apiClient.getMenWashingMachineBookings({ limit: 50 }),
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

  const handleMachineClick = (facility: WashingMachineFacility) => {
    console.log('Selected machine:', facility)
    // TODO: Open booking modal
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
            Interactive floor plan for washing machine reservations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('women')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'women'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Women's Section
            </button>
            <button
              onClick={() => setActiveTab('men')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'men'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Men's Section
            </button>
          </div>
        </div>

        {/* Machine Layout */}
        <WashingMachineLayout
          facilities={activeTab === 'women' ? womenFacilities : menFacilities}
          bookings={activeTab === 'women' ? womenBookings : menBookings}
          type={activeTab}
          onMachineClick={handleMachineClick}
        />

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Status Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {womenFacilities.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Women's Machines
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {menFacilities.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Men's Machines
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {womenBookings.filter(b => new Date(b.waktuBerakhir) > new Date()).length + 
                 menBookings.filter(b => new Date(b.waktuBerakhir) > new Date()).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Bookings
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {womenFacilities.length + menFacilities.length - 
                 womenBookings.filter(b => new Date(b.waktuMulai) <= new Date() && new Date(b.waktuBerakhir) > new Date()).length -
                 menBookings.filter(b => new Date(b.waktuMulai) <= new Date() && new Date(b.waktuBerakhir) > new Date()).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available Now
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need to do laundry?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Click on any machine in the layout above to see its status and book a slot. 
              Our interactive system prevents conflicts and helps you plan your laundry schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/users"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Manage Users
              </Link>
              <button 
                onClick={() => {
                  // Scroll to the layout
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
                className="bg-purple-600 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Select Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
