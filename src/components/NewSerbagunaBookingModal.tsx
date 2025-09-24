"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import SerbagunaTimeSlotPicker from "./SerbagunaTimeSlotPicker";
import SerbagunaAreaSelector from "./SerbagunaAreaSelector";

interface TimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
  display: string;
  value: string;
  endValue: string;
  available?: boolean;
}

interface NewSerbagunaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function NewSerbagunaBookingModal({
  isOpen,
  onClose,
  onBookingSuccess,
}: NewSerbagunaBookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [jumlahPengguna, setJumlahPengguna] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      console.log("📅 Serbaguna Modal opened, setting default date:", today);
      setSelectedDate(today);
      setSelectedAreaId(null);
      setSelectedSlot(null);
      setJumlahPengguna("");
      setKeterangan("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !user || !selectedAreaId) {
      return; // Silent fail
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        idPenanggungJawab: user.id,
        idArea: selectedAreaId,
        waktuMulai: selectedSlot.value,
        waktuBerakhir: selectedSlot.endValue,
        jumlahPengguna: jumlahPengguna,
        keterangan: keterangan,
        isDone: false,
      };

      console.log("Creating serbaguna booking:", bookingData);

      const response = await apiClient.createSerbagunaBooking(bookingData);

      if (response.success) {
        console.log("✅ Serbaguna booking success:", response.data);
        onBookingSuccess();
        onClose();

        // Reset form
        setSelectedAreaId(null);
        setSelectedSlot(null);
        setJumlahPengguna("");
        setKeterangan("");
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: any) {
      console.error("❌ Error creating serbaguna booking:", err);
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    console.log("📅 Serbaguna Date change requested:", newDate);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const handleAreaChange = (areaId: string | null) => {
    console.log("🏢 Serbaguna Area change requested:", areaId);
    setSelectedAreaId(areaId);
    setSelectedSlot(null); // Clear selected slot when area changes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book Serbaguna Area
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

            {/* Area Selection */}
            <div>
              <SerbagunaAreaSelector
                selectedAreaId={selectedAreaId}
                onAreaSelect={handleAreaChange}
              />
            </div>

            {/* Number of Participants */}
            <div>
              <label
                htmlFor="jumlahPengguna"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Number of Participants *
              </label>
              <input
                type="number"
                id="jumlahPengguna"
                value={jumlahPengguna}
                onChange={(e) => setJumlahPengguna(e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter number of participants"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="keterangan"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Description/Purpose *
              </label>
              <textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the purpose of your booking (e.g., Team meeting, Workshop, etc.)"
                required
              />
            </div>

            {/* Time Slot Picker - Only show if area is selected */}
            {selectedAreaId && (
              <div>
                <SerbagunaTimeSlotPicker
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  onDateChange={handleDateChange}
                  selectedAreaId={selectedAreaId}
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
                disabled={
                  loading ||
                  !selectedSlot ||
                  !selectedAreaId ||
                  !jumlahPengguna ||
                  !keterangan
                }
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Booking..." : "Book Area"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

