"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, TicketIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import TheaterTimeSlotPicker, {
  TheaterTimeSlotOption,
} from "./TheaterTimeSlotPicker";

interface NewTheaterBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function NewTheaterBookingModal({
  isOpen,
  onClose,
  onBookingSuccess,
}: NewTheaterBookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] =
    useState<TheaterTimeSlotOption | null>(null);
  const [jumlahPengguna, setJumlahPengguna] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
      setSelectedSlot(null);
      setJumlahPengguna("");
      setKeterangan("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("User not found. Please login again.");
      return;
    }

    if (!selectedSlot) {
      setError("Please pick an available time slot");
      return;
    }

    if (!jumlahPengguna) {
      setError("Number of participants is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createTheaterBooking({
        idPenanggungJawab: user.id,
        waktuMulai: selectedSlot.value,
        waktuBerakhir: selectedSlot.endValue,
        jumlahPengguna,
        keterangan,
        isDone: false,
      });

      if (response.success) {
        onBookingSuccess();
        onClose();
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create booking";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <TicketIcon className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Book Theater Session
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reserve the theater for a 1-hour slot between 06:00 - 22:00 WIB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Booking for
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.namaLengkap} ({user?.namaPanggilan})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.nomorWa}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="jumlahPengguna"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Number of Participants *
              </label>
              <input
                id="jumlahPengguna"
                name="jumlahPengguna"
                type="number"
                min={1}
                max={100}
                value={jumlahPengguna}
                onChange={(event) => setJumlahPengguna(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 20"
                required
              />
            </div>
            <div>
              <label
                htmlFor="keterangan"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Description / Purpose *
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                value={keterangan}
                onChange={(event) => setKeterangan(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the event or activity"
                required
              />
            </div>
          </div>

          <TheaterTimeSlotPicker
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
          />

          <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
