"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { WashingMachineFacility } from "@/types/api";
import WashingMachineTimeSlotPicker from "./WashingMachineTimeSlotPicker";

interface TimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
  display: string;
  value: string;
  endValue: string;
  available?: boolean;
}

interface NewWashingMachineBookingModalProps {
  facility: WashingMachineFacility | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function NewWashingMachineBookingModal({
  facility,
  isOpen,
  onClose,
  onBookingSuccess,
}: NewWashingMachineBookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      console.log(
        "📅 Washing Machine Modal opened, setting default date:",
        today
      );
      setSelectedDate(today);
      setSelectedSlot(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !user || !facility) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = new Date(selectedSlot.value);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // 1-hour slots

      const bookingData = {
        idFasilitas: facility.id,
        idPeminjam: user.id,
        waktuMulai: startTime.toISOString(),
        waktuBerakhir: endTime.toISOString(),
      };

      console.log("Creating washing machine booking:", bookingData);

      const response = facility.nama.toLowerCase().includes("cowo")
        ? await apiClient.createMenWashingMachineBooking(bookingData)
        : await apiClient.createWomenWashingMachineBooking(bookingData);

      if (response.success) {
        console.log("✅ Booking success:", response.data);
        onBookingSuccess();
        onClose();
        setSelectedSlot(null); // reset
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: unknown) {
      console.error("❌ Error creating washing machine booking:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create booking";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    console.log("📅 Date change requested:", newDate);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  if (!isOpen || !facility) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book {facility.nama}
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
            {/* User Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Booking as:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.namaLengkap} ({user?.namaPanggilan})
              </p>
            </div>

            {/* Machine Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Machine:
              </p>
              <p className="font-medium text-blue-900 dark:text-blue-300">
                {facility.nama}
              </p>
            </div>

            {/* Time Slot Picker */}
            <div>
              <WashingMachineTimeSlotPicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                onDateChange={handleDateChange}
                type={
                  facility.nama.toLowerCase().includes("cowo") ? "men" : "women"
                }
                facilityId={facility.id}
              />
            </div>

            {/* Actions */}
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
                disabled={loading || !selectedSlot}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Booking..." : "Book Machine"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
