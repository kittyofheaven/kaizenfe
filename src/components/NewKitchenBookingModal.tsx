"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import KitchenTimeSlotPicker from "./KitchenTimeSlotPicker";
import KitchenFacilitySelector from "./KitchenFacilitySelector";

interface TimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
  display: string;
  value: string;
  endValue: string;
  available?: boolean;
}

interface NewKitchenBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function NewKitchenBookingModal({
  isOpen,
  onClose,
  onBookingSuccess,
}: NewKitchenBookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [pinjamPeralatan, setPinjamPeralatan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      console.log("📅 Kitchen Modal opened, setting default date:", today);
      setSelectedDate(today);
      setSelectedFacilityId(null);
      setSelectedSlot(null);
      setPinjamPeralatan(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !user || !selectedFacilityId) {
      return; // Silent fail
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        idFasilitas: selectedFacilityId,
        idPeminjam: user.id,
        waktuMulai: selectedSlot.value,
        waktuBerakhir: selectedSlot.endValue,
        pinjamPeralatan: pinjamPeralatan,
      };

      console.log("Creating kitchen booking:", bookingData);

      const response = await apiClient.createKitchenBooking(bookingData);

      if (response.success) {
        console.log("✅ Kitchen booking success:", response.data);
        onBookingSuccess();
        onClose();

        // Reset form
        setSelectedFacilityId(null);
        setSelectedSlot(null);
        setPinjamPeralatan(false);
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: any) {
      console.error("❌ Error creating kitchen booking:", err);
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    console.log("📅 Kitchen Date change requested:", newDate);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const handleFacilityChange = (facilityId: string | null) => {
    console.log("🍳 Kitchen Facility change requested:", facilityId);
    setSelectedFacilityId(facilityId);
    setSelectedSlot(null); // Clear selected slot when facility changes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book Kitchen Facility
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Info Display */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Booking as:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.namaLengkap} ({user?.namaPanggilan})
              </p>
            </div>

            {/* Facility Selection */}
            <div>
              <KitchenFacilitySelector
                selectedFacilityId={selectedFacilityId}
                onFacilitySelect={handleFacilityChange}
              />
            </div>

            {/* Equipment Rental */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={pinjamPeralatan}
                  onChange={(e) => setPinjamPeralatan(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Pinjam Peralatan Tambahan
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Centang jika ingin meminjam peralatan tambahan untuk keperluan
                memasak
              </p>
            </div>

            {/* Time Slot Picker - Only show if facility is selected */}
            {selectedFacilityId && (
              <div>
                <KitchenTimeSlotPicker
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  onDateChange={handleDateChange}
                  selectedFacilityId={selectedFacilityId}
                />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedSlot || !selectedFacilityId}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Booking..." : "Book Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

