"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { apiClient, ApiError } from "@/lib/api";
import type { TimeSlot as ApiTimeSlot } from "@/types/api";

export interface CommunalTimeSlotOption {
  hour: number;
  display: string;
  value: string;
  endValue: string;
  available: boolean;
}

interface CommunalTimeSlotPickerProps {
  selectedDate: string;
  selectedSlot: CommunalTimeSlotOption | null;
  onSlotSelect: (slot: CommunalTimeSlotOption | null) => void;
  onDateChange: (date: string) => void;
  floor: string;
}

const OPERATING_HOURS = { start: 6, end: 22 } as const;

const toIsoUtc = (date: string, hour: number) => {
  const [year, month, day] = date.split("-").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    const fallback = new Date();
    fallback.setUTCHours(hour, 0, 0, 0);
    return fallback.toISOString();
  }
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString();
};

const generateDefaultSlots = (date: string): CommunalTimeSlotOption[] => {
  const slots: CommunalTimeSlotOption[] = [];

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
  slots: ApiTimeSlot[],
  date: string
): CommunalTimeSlotOption[] => {
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
    } satisfies CommunalTimeSlotOption;
  });
};

const formatDateLabel = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const toWibDateString = (date: Date) => {
  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wibDate.toISOString().split("T")[0];
};

const isPastSlot = (slot: CommunalTimeSlotOption) => {
  return new Date(slot.value) < new Date();
};

export default function CommunalTimeSlotPicker({
  selectedDate,
  selectedSlot,
  onSlotSelect,
  onDateChange,
  floor,
}: CommunalTimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<CommunalTimeSlotOption[]>(() =>
    generateDefaultSlots(selectedDate)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNavigate = useMemo(() => Boolean(selectedDate && floor), [
    selectedDate,
    floor,
  ]);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDate || !floor) {
      setTimeSlots(generateDefaultSlots(selectedDate));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getCommunalAvailableSlots(
        selectedDate,
        floor
      );

      if (response.success && response.data) {
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
          : "Failed to load communal slots";
      setError(message);
      setTimeSlots(generateDefaultSlots(selectedDate));
    } finally {
      setLoading(false);
    }
  }, [floor, selectedDate]);

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

  const handleSlotClick = (slot: CommunalTimeSlotOption) => {
    if (!slot.available || isPastSlot(slot)) {
      return;
    }

    if (selectedSlot?.value === slot.value) {
      onSlotSelect(null);
    } else {
      onSlotSelect(slot);
    }
  };

  const renderStatus = (slot: CommunalTimeSlotOption) => {
    if (!slot.available) {
      return (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          Unavailable
        </span>
      );
    }

    if (isPastSlot(slot)) {
      return (
        <span className="text-xs font-medium text-orange-500">Past</span>
      );
    }

    if (selectedSlot?.value === slot.value) {
      return (
        <span className="text-xs font-medium text-primary">Selected</span>
      );
    }

    return (
      <span className="text-xs text-muted-foreground">Available</span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePreviousDay}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          disabled={!canNavigate}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold">{formatDateLabel(selectedDate)}</h3>
          <p className="text-sm text-muted-foreground">Floor {floor}</p>
          <button
            type="button"
            onClick={handleToday}
            className="text-xs text-primary hover:underline mt-1"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          disabled={!canNavigate}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot) => {
          const isSelected = selectedSlot?.value === slot.value;
          const isUnavailable = !slot.available || isPastSlot(slot);

          return (
            <button
              type="button"
              key={slot.value}
              onClick={() => handleSlotClick(slot)}
              disabled={isUnavailable}
              className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary hover:border-primary/50"
              } ${
                isUnavailable && !isSelected
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{slot.display}</span>
              </div>
              {renderStatus(slot)}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">
          Checking availability...
        </p>
      )}
    </div>
  );
}
