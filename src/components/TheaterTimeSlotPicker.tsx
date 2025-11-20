"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { apiClient, ApiError } from "@/lib/api";
import type { TimeSlot as ApiTimeSlot } from "@/types/api";

export interface TheaterTimeSlotOption {
  hour: number;
  display: string;
  value: string;
  endValue: string;
  available: boolean;
}

interface TheaterTimeSlotPickerProps {
  selectedDate: string;
  selectedSlot: TheaterTimeSlotOption | null;
  onSlotSelect: (slot: TheaterTimeSlotOption | null) => void;
  onDateChange: (date: string) => void;
}

const OPERATING_HOURS = { start: 6, end: 22 } as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getNormalizedDate = (date: string): string => {
  if (DATE_PATTERN.test(date)) {
    return date;
  }

  const fallback = new Date();
  return fallback.toISOString().split("T")[0];
};

const toIsoUtc = (rawDate: string, hour: number) => {
  const date = getNormalizedDate(rawDate);
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));

  if (Number.isNaN(target.getTime())) {
    const fallback = new Date();
    fallback.setUTCHours(hour, 0, 0, 0);
    return fallback.toISOString();
  }

  return target.toISOString();
};

const generateDefaultSlots = (rawDate: string): TheaterTimeSlotOption[] => {
  const date = getNormalizedDate(rawDate);
  const slots: TheaterTimeSlotOption[] = [];

  for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
    const startHour = hour.toString().padStart(2, "0");
    const endHour = (hour + 1).toString().padStart(2, "0");

    slots.push({
      hour,
      display: `${startHour}:00 - ${endHour}:00`,
      value: toIsoUtc(date, hour),
      endValue: toIsoUtc(date, hour + 1),
      available: true,
    });
  }

  return slots;
};

const mapApiSlots = (
  slots: ApiTimeSlot[] | undefined,
  date: string
): TheaterTimeSlotOption[] => {
  if (!Array.isArray(slots) || slots.length === 0) {
    return generateDefaultSlots(date);
  }

  return slots.map((slot) => {
    const start = new Date(slot.waktuMulai);
    const end = new Date(slot.waktuBerakhir);
    const startHour = start.getHours().toString().padStart(2, "0");
    const endHour = end.getHours().toString().padStart(2, "0");

    return {
      hour: start.getHours(),
      display: slot.display ?? `${startHour}:00 - ${endHour}:00`,
      value: start.toISOString(),
      endValue: end.toISOString(),
      available: slot.available !== false,
    } satisfies TheaterTimeSlotOption;
  });
};

const toWibDateString = (date: Date) => {
  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wibDate.toISOString().split("T")[0];
};

const isPastSlot = (slot: TheaterTimeSlotOption) => {
  return new Date(slot.value) < new Date();
};

export default function TheaterTimeSlotPicker({
  selectedDate,
  selectedSlot,
  onSlotSelect,
  onDateChange,
}: TheaterTimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<TheaterTimeSlotOption[]>(() =>
    generateDefaultSlots(selectedDate)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasValidDate = useMemo(() => Boolean(selectedDate), [selectedDate]);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDate) {
      setTimeSlots(generateDefaultSlots(selectedDate));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getTheaterTimeSlots({
        date: selectedDate,
      });

      if (response.success) {
        setTimeSlots(mapApiSlots(response.data, selectedDate));
      } else {
        setTimeSlots(generateDefaultSlots(selectedDate));
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to load theater slots";
      setError(message);
      setTimeSlots(generateDefaultSlots(selectedDate));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const handlePreviousDay = () => {
    if (!selectedDate) return;
    const [year, month, day] = selectedDate.split("-").map(Number);
    const currentDate = new Date(Date.UTC(year, month - 1, day));
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    onDateChange(toWibDateString(currentDate));
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const [year, month, day] = selectedDate.split("-").map(Number);
    const currentDate = new Date(Date.UTC(year, month - 1, day));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    onDateChange(toWibDateString(currentDate));
  };

  const handleToday = () => {
    onDateChange(toWibDateString(new Date()));
  };

  const handleSlotClick = (slot: TheaterTimeSlotOption) => {
    if (!slot.available || isPastSlot(slot)) {
      return;
    }

    if (selectedSlot?.value === slot.value) {
      onSlotSelect(null);
    } else {
      onSlotSelect(slot);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Pick a date and time slot
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Operating hours: 06:00 - 22:00 WIB (1-hour slots)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreviousDay}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={!hasValidDate}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextDay}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={!hasValidDate}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Selected date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            onDateChange(event.target.value);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {timeSlots.map((slot) => {
          const isSelected = selectedSlot?.value === slot.value;
          const disabled = !slot.available || isPastSlot(slot);

          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => handleSlotClick(slot)}
              disabled={disabled}
              className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {slot.display}
                </span>
                <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  !slot.available
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : isPastSlot(slot)
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {!slot.available
                  ? "Unavailable"
                  : isPastSlot(slot)
                  ? "Past"
                  : "Available"}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading time slots...
        </p>
      )}
    </div>
  );
}
