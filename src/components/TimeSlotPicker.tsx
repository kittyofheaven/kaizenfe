'use client'

import { TimeSlot } from '@/types/api'
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSlotSelect: (slot: TimeSlot) => void
}

export default function TimeSlotPicker({ slots, selectedSlot, onSlotSelect }: TimeSlotPickerProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.available === false) return 'unavailable'
    if (selectedSlot && slot.waktuMulai === selectedSlot.waktuMulai) return 'selected'
    return 'available'
  }

  const getSlotClasses = (status: string) => {
    const baseClasses = "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200"
    
    switch (status) {
      case 'selected':
        return `${baseClasses} border-primary bg-primary text-white`
      case 'unavailable':
        return `${baseClasses} border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed`
      case 'available':
      default:
        return `${baseClasses} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10`
    }
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No time slots available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please select a different date or floor.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot, index) => {
          const status = getSlotStatus(slot)
          const isClickable = slot.available !== false
          
          return (
            <div
              key={index}
              className={getSlotClasses(status)}
              onClick={() => isClickable && onSlotSelect(slot)}
            >
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {formatTime(slot.waktuMulai)} - {formatTime(slot.waktuBerakhir)}
                </span>
              </div>
              
              <div className="flex items-center">
                {status === 'selected' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {status === 'unavailable' && (
                  <XMarkIcon className="h-4 w-4" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Booked</span>
        </div>
      </div>

      {selectedSlot && (
        <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center text-primary">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Selected: {formatTime(selectedSlot.waktuMulai)} - {formatTime(selectedSlot.waktuBerakhir)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
