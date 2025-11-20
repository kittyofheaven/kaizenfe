"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import CWSTimeSlotPicker from "./CWSTimeSlotPicker";

interface TimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
  display: string;
  value: string;
  endValue: string;
  available?: boolean;
}

interface NewCWSBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const isThursday = (dateString: string) => {
  if (!dateString) return false;
  const parsed = new Date(`${dateString}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.getDay() === 4;
};

export default function NewCWSBookingModal({
  isOpen,
  onClose,
  onBookingSuccess,
}: NewCWSBookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [jumlahPengguna, setJumlahPengguna] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isThursdaySelected = isThursday(selectedDate);

  // Set default date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      console.log("📅 CWS Modal opened, setting default date:", today);
      setSelectedDate(today);
      setSelectedSlot(null);
      setJumlahPengguna("");
      setKeterangan("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !user) {
      return; // Silent fail
    }

    if (isThursdaySelected) {
      setError("CWS bookings are unavailable every Thursday. Please choose another day.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        idPenanggungJawab: user.id,
        waktuMulai: selectedSlot.value,
        waktuBerakhir: selectedSlot.endValue,
        jumlahPengguna: jumlahPengguna,
        keterangan: keterangan,
        isDone: false,
      };

      console.log("Creating CWS booking:", bookingData);

      const response = await apiClient.createCWSBooking(bookingData);

      if (response.success) {
        console.log("CWS booking created successfully:", response.data);
        onBookingSuccess();
        onClose();

        // Reset form
        setSelectedSlot(null);
        setJumlahPengguna("");
        setKeterangan("");
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: unknown) {
      console.error("Error creating CWS booking:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create booking";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    console.log("📅 CWS Date change requested:", newDate);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <BuildingOffice2Icon className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book Community Work Space
            </h2>
          </div>
          <button
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

            {isThursdaySelected && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200">
                CWS bookings are closed every Thursday. Please choose another
                day.
              </div>
            )}

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

            {/* Time Slot Picker */}
            <div>
              <CWSTimeSlotPicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                onDateChange={handleDateChange}
              />
            </div>

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
                  !jumlahPengguna ||
                  !keterangan ||
                  isThursdaySelected
                }
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Booking..." : "Book CWS"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
