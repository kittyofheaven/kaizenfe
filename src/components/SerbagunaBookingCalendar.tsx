"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api";
import type {
  SerbagunaArea,
  SerbagunaBooking,
  TimeSlot as ApiTimeSlot,
} from "@/types/api";

interface CalendarSlot {
  hour: number;
  display: string;
  available: boolean;
  booking: SerbagunaBooking | null;
}

interface SerbagunaBookingCalendarProps {
  areas: SerbagunaArea[];
}

const START_HOUR = 6;
const END_HOUR = 22;

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const toDateInputValue = (date: Date) => date.toISOString().split("T")[0];

const generateDefaultSlots = (): CalendarSlot[] => {
  const slots: CalendarSlot[] = [];

  for (let hour = START_HOUR; hour < END_HOUR; hour += 2) {
    const endHour = hour + 2;
    const startLabel = hour.toString().padStart(2, "0");
    const endLabel = endHour.toString().padStart(2, "0");

    slots.push({
      hour,
      display: `${startLabel}:00 - ${endLabel}:00`,
      available: true,
      booking: null,
    });
  }

  return slots;
};

export default function SerbagunaBookingCalendar({
  areas,
}: SerbagunaBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedArea, setSelectedArea] = useState<string | null>(
    areas[0]?.id ?? null
  );
  const [slots, setSlots] = useState<CalendarSlot[]>(() => generateDefaultSlots());
  const [bookings, setBookings] = useState<SerbagunaBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateString = useMemo(() => toDateInputValue(currentDate), [currentDate]);

  useEffect(() => {
    if (areas.length > 0 && !selectedArea) {
      setSelectedArea(areas[0].id);
      return;
    }

    if (areas.length > 0 && selectedArea) {
      const exists = areas.some((area) => area.id === selectedArea);
      if (!exists) {
        setSelectedArea(areas[0].id);
        return;
      }
    }

    if (areas.length === 0) {
      setSelectedArea(null);
      setSlots(generateDefaultSlots());
      setBookings([]);
    }
  }, [areas, selectedArea]);

  const fetchCalendar = useCallback(async () => {
    if (!selectedArea) {
      setSlots(generateDefaultSlots());
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
        const [availabilityRes, bookingsRes] = await Promise.all([
          apiClient.getSerbagunaAvailableSlots(dateString, selectedArea),
          apiClient.getSerbagunaBookings({
            limit: 100,
            sortBy: "waktuMulai",
            sortOrder: "asc",
          }),
        ]);

      const availability: ApiTimeSlot[] =
        availabilityRes.success && Array.isArray(availabilityRes.data)
          ? availabilityRes.data
          : [];

      const allBookings =
        bookingsRes.success && Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : [];

      const filteredBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.waktuMulai)
          .toISOString()
          .split("T")[0];
        return booking.idArea === selectedArea && bookingDate === dateString;
      });

      const computedSlots = generateDefaultSlots().map((slot) => {
        const apiSlot = availability.find((item) => {
          const start = new Date(item.waktuMulai);
          return start.getHours() === slot.hour;
        });

        const booking = filteredBookings.find((item) => {
          const start = new Date(item.waktuMulai);
          return start.getHours() === slot.hour;
        });

        return {
          ...slot,
          available: apiSlot ? apiSlot.available !== false : !booking,
          booking: booking ?? null,
        } satisfies CalendarSlot;
      });

      setSlots(computedSlots);
      setBookings(filteredBookings);
    } catch (err: unknown) {
      console.error("Error fetching serbaguna calendar:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load calendar data";
      setError(message);
      setSlots(generateDefaultSlots());
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [dateString, selectedArea]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const bookedCount = slots.filter((slot) => !slot.available).length;
  const availableCount = slots.length - bookedCount;
  const participantCount = useMemo(
    () =>
      bookings.reduce((total, booking) => {
        const parsed = parseInt(booking.jumlahPengguna, 10);
        return Number.isFinite(parsed) ? total + parsed : total;
      }, 0),
    [bookings]
  );

  if (areas.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <CalendarIcon className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Serbaguna Schedule
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No serbaguna areas available. Add areas to view the calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Serbaguna Schedule
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View bookings and availability for each area
              </p>
            </div>
          </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <MapPinIcon className="h-4 w-4" />
              <span>Area</span>
              <select
                value={selectedArea ?? ""}
                onChange={(event) => setSelectedArea(event.target.value || null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.namaArea}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                type="button"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDateLabel(currentDate)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dateString}
                </p>
              </div>
              <button
                onClick={goToNextDay}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                type="button"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              type="button"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>
            Booked: <strong>{bookedCount}</strong>
          </span>
          <span>
            Available: <strong>{availableCount}</strong>
          </span>
          <span>
            Viewing: <strong>{areas.find((area) => area.id === selectedArea)?.namaArea}</strong>
          </span>
          <span>
            Participants today: <strong>{participantCount}</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Choose date
            <input
              type="date"
              value={dateString}
              onChange={(event) => {
                if (!event.target.value) return;
                const nextDate = new Date(`${event.target.value}T00:00:00`);
                if (!Number.isNaN(nextDate.getTime())) {
                  setCurrentDate(nextDate);
                }
              }}
              className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            />
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading calendar...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const status = slot.available ? "available" : "booked";

              return (
                <div
                  key={`${slot.hour}-${selectedArea}`}
                  className={`rounded-lg border p-4 transition-all ${
                    slot.available
                      ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {slot.display}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === "booked"
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                          : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {status === "booked" ? "Booked" : "Available"}
                    </span>
                  </div>

                  {slot.booking ? (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {slot.booking.penanggungJawab?.namaLengkap ||
                            slot.booking.penanggungJawab?.namaPanggilan ||
                            "Reserved"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {slot.booking.keterangan || "Serbaguna Session"}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        👥 {slot.booking.jumlahPengguna} participants
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No bookings for this slot
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
