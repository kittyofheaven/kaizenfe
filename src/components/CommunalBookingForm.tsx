'use client'

import { useState, useEffect } from 'react'
import { CommunalBooking, CreateCommunalBookingRequest, User, TimeSlot } from '@/types/api'
import { apiClient } from '@/lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'
import TimeSlotPicker from './TimeSlotPicker'

interface CommunalBookingFormProps {
  booking?: CommunalBooking | null
  users: User[]
  onSubmit: (bookingData: CreateCommunalBookingRequest) => Promise<void>
  onClose: () => void
}

export default function CommunalBookingForm({ booking, users, onSubmit, onClose }: CommunalBookingFormProps) {
  const [formData, setFormData] = useState<CreateCommunalBookingRequest>({
    idPenanggungJawab: '',
    waktuMulai: '',
    waktuBerakhir: '',
    jumlahPengguna: '',
    lantai: '1',
    keterangan: '',
    isDone: false,
  })
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.waktuMulai)
      const dateString = startDate.toISOString().split('T')[0]
      
      setFormData({
        idPenanggungJawab: booking.idPenanggungJawab,
        waktuMulai: booking.waktuMulai,
        waktuBerakhir: booking.waktuBerakhir,
        jumlahPengguna: booking.jumlahPengguna,
        lantai: booking.lantai,
        keterangan: booking.keterangan,
        isDone: booking.isDone,
      })
      setSelectedDate(dateString)
    } else {
      // Set default date to today
      const today = new Date()
      const dateString = today.toISOString().split('T')[0]
      setSelectedDate(dateString)
    }
  }, [booking])

  useEffect(() => {
    if (selectedDate && formData.lantai) {
      fetchAvailableSlots()
    }
  }, [selectedDate, formData.lantai])

  const fetchAvailableSlots = async () => {
    try {
      const response = await apiClient.getCommunalAvailableSlots(selectedDate, formData.lantai)
      setAvailableSlots(response.data || [])
    } catch (err) {
      console.error('Error fetching available slots:', err)
      setAvailableSlots([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const bookingData = {
        ...formData,
        waktuMulai: selectedSlot.waktuMulai,
        waktuBerakhir: selectedSlot.waktuBerakhir,
      }
      
      await onSubmit(bookingData)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {booking ? 'Edit Communal Room Booking' : 'New Communal Room Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsible Person */}
            <div>
              <label htmlFor="idPenanggungJawab" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsible Person *
              </label>
              <select
                id="idPenanggungJawab"
                name="idPenanggungJawab"
                value={formData.idPenanggungJawab}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a person</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.namaLengkap} ({user.namaPanggilan})
                  </option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="lantai" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor *
              </label>
              <select
                id="lantai"
                name="lantai"
                value={formData.lantai}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number of Users */}
            <div>
              <label htmlFor="jumlahPengguna" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of People *
              </label>
              <input
                type="number"
                id="jumlahPengguna"
                name="jumlahPengguna"
                value={formData.jumlahPengguna}
                onChange={handleChange}
                min="1"
                max="50"
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available Time Slots *
              </label>
              <TimeSlotPicker
                slots={availableSlots}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Purpose of the meeting, special requirements, etc."
            />
          </div>

          {/* Is Done Checkbox */}
          {booking && (
            <div className="flex items-center">
              <input
                id="isDone"
                name="isDone"
                type="checkbox"
                checked={formData.isDone}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="isDone" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Mark as completed
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
