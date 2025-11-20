"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { TimeSlot as ApiTimeSlot } from "@/types/api";

interface CwsTimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
  display: string;
  value: string;
  endValue: string;
  available?: boolean;
  closed?: boolean;
}

interface CWSTimeSlotPickerProps {
  selectedDate: string;
  selectedSlot: CwsTimeSlot | null;
  onSlotSelect: (slot: CwsTimeSlot | null) => void;
  onDateChange: (date: string) => void;
}

const toIsoUtc = (date: string, hour: number) => {
  const [year, month, day] = date.split("-").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    const fallback = new Date();
    fallback.setUTCHours(hour, 0, 0, 0);
    return fallback.toISOString();
  }
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString();
};

const buildDefaultCWSSlots = (
  date: string,
  { closed }: { closed?: boolean } = {}
): CwsTimeSlot[] => {
  const slots: CwsTimeSlot[] = [];
  for (let hour = 6; hour < 22; hour += 2) {
    const endHour = hour + 2;
    const startHourStr = hour.toString().padStart(2, "0");
    const endHourStr = endHour.toString().padStart(2, "0");

    slots.push({
      hour,
      startTime: `${startHourStr}:00`,
      endTime: `${endHourStr}:00`,
      display: `${startHourStr}:00 - ${endHourStr}:00`,
      value: toIsoUtc(date, hour),
      endValue: toIsoUtc(date, endHour),
      available: !closed,
      closed,
    });
  }
  return slots;
};

export default function CWSTimeSlotPicker({
  selectedDate,
  selectedSlot,
  onSlotSelect,
  onDateChange,
}: CWSTimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<CwsTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const isThursday = useCallback((dateString: string) => {
    if (!dateString) return false;
    const parsed = new Date(`${dateString}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed.getDay() === 4;
  }, []);

  const isThursdaySelected = isThursday(selectedDate);

  // Fetch time slots from CWS API (for availability check only)
  const fetchTimeSlots = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found, using default CWS time slots");
        setTimeSlots(buildDefaultCWSSlots(date));
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/v1/cws/time-slots?date=${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: { success: boolean; data?: ApiTimeSlot[] } =
        await response.json();

      if (result.success && Array.isArray(result.data)) {
        const slots: CwsTimeSlot[] = result.data.map((slot) => {
          const start = new Date(slot.waktuMulai);
          const end = new Date(slot.waktuBerakhir);
          const startHour = start.getHours().toString().padStart(2, "0");
          const endHour = end.getHours().toString().padStart(2, "0");

          return {
            hour: start.getHours(),
            startTime: slot.waktuMulai,
            endTime: slot.waktuBerakhir,
            display: slot.display ?? `${startHour}:00 - ${endHour}:00`,
            value: slot.waktuMulai,
            endValue: slot.waktuBerakhir,
            available: slot.available,
          } satisfies CwsTimeSlot;
        });

        setTimeSlots(slots);
      } else {
        setTimeSlots(buildDefaultCWSSlots(date));
      }
    } catch (error: unknown) {
      console.error("Error fetching CWS time slots:", error);
      setTimeSlots(buildDefaultCWSSlots(date));
    } finally {
      setLoading(false);
    }
  }, []);

  // Date navigation functions
  const goToPreviousDay = () => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const currentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    const wibDate = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000);
    const newDate = wibDate.toISOString().split("T")[0];
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const currentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    const wibDate = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000);
    const newDate = wibDate.toISOString().split("T")[0];
    onDateChange(newDate);
  };

  const goToToday = () => {
    const now = new Date();
    const wibDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const today = wibDate.toISOString().split("T")[0];
    onDateChange(today);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  // Check if slot is in the past
  const isSlotInPast = (slot: CwsTimeSlot) => {
    const now = new Date();
    const slotTime = new Date(slot.value);
    return slotTime < now;
  };

  const handleSlotClick = (slot: CwsTimeSlot) => {
    if (isThursdaySelected || slot.closed || !slot.available || isSlotInPast(slot)) {
      return;
    }

    if (selectedSlot?.value === slot.value) {
      onSlotSelect(null);
    } else {
      onSlotSelect(slot);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;

    if (isThursdaySelected) {
      const closedSlots = buildDefaultCWSSlots(selectedDate, { closed: true });
      setTimeSlots(closedSlots);
      setLoading(false);
      return;
    }

    fetchTimeSlots(selectedDate);
  }, [selectedDate, isThursdaySelected, fetchTimeSlots]);

  useEffect(() => {
    if (isThursdaySelected && selectedSlot) {
      onSlotSelect(null);
    }
  }, [isThursdaySelected, selectedSlot, onSlotSelect]);

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousDay}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {formatDate(selectedDate)}
          </h3>
          {isToday(selectedDate) && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Hari ini
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={goToNextDay}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Today Button */}
      {!isToday(selectedDate) && (
        <div className="text-center">
          <button
            type="button"
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Hari Ini
          </button>
        </div>
      )}

      {/* Time Slots */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Available Time Slots (2-hour sessions)
        </h3>

        {!localStorage.getItem("token") && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ You are not logged in. Showing default time slots.
              <a href="/login" className="underline ml-1">
                Login
              </a>{" "}
              to see real-time availability.
            </p>
          </div>
        )}

        {isThursdaySelected && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            CWS bookings are unavailable every Thursday. Please pick another
            day.
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Loading time slots...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const isPast = isSlotInPast(slot);
              const isClosed = Boolean(slot.closed);
              const isBooked = !slot.available && !isClosed;
              const isSelected = selectedSlot?.value === slot.value;
              const isDisabled = isClosed || !slot.available || isPast;

              return (
                <button
                  type="button"
                  key={slot.value}
                  onClick={() => handleSlotClick(slot)}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-lg border-2 text-sm font-medium transition-all
                    ${
                      isPast
                        ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed dark:border-red-800 dark:bg-red-900/20 dark:text-red-500"
                        : isClosed
                        ? "border-amber-200 bg-amber-50 text-amber-600 cursor-not-allowed dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                        : isBooked
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                        : isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:text-gray-200"
                    }
                  `}
                >
                    <div className="text-center">
                      <div className="font-semibold text-base">
                        {slot.display}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        2-hour session
                      </div>
                      {isPast && (
                        <div className="text-xs text-red-500 mt-1">Past</div>
                      )}
                      {isClosed && !isPast && (
                        <div className="text-xs text-amber-600 mt-1 dark:text-amber-300">
                          Closed on Thursday
                        </div>
                      )}
                      {isBooked && !isPast && !isClosed && (
                        <div className="text-xs text-red-500 mt-1">Booked</div>
                      )}
                    </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Selected Time Slot
          </h4>
          <p className="text-blue-700 dark:text-blue-300">
            {selectedSlot.display} (2-hour session)
          </p>
        </div>
      )}
    </div>
  );
}
