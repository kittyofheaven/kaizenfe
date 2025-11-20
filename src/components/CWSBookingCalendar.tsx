"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CWSBooking } from "@/types/api";
import { apiClient } from "@/lib/api";

interface CalendarSlot {
  hour: number;
  display: string;
  available: boolean;
  booking: CWSBooking | null;
}

interface CWSDayBooking {
  date: string;
  bookings: CWSBooking[];
  timeSlots: CalendarSlot[];
}

export default function CWSBookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayBookings, setDayBookings] = useState<CWSDayBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate CWS time slots with actual booking data
  const generateCWSTimeSlotsWithBookings = (bookings: CWSBooking[]) => {
    const slots: CalendarSlot[] = [];

    // CWS has 2-hour slots: 06:00-08:00, 08:00-10:00, 10:00-12:00, 12:00-14:00, 14:00-16:00, 16:00-18:00, 18:00-20:00, 20:00-22:00
    for (let hour = 6; hour < 22; hour += 2) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const endTimeString = `${(hour + 2).toString().padStart(2, "0")}:00`;

      // Find matching booking for this time slot
      const booking = bookings.find((booking) => {
        const bookingStart = new Date(booking.waktuMulai);
        return bookingStart.getHours() === hour;
      });

      slots.push({
        hour,
        display: `${timeString} - ${endTimeString}`,
        available: !booking,
        booking: booking ?? null,
      });
    }

    return slots;
  };

  const fetchBookingsForDate = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);

    try {
      const dateString = date.toISOString().split("T")[0];

      // Use the new CWS date endpoint to get actual bookings with details
      const bookingsResponse = await apiClient.getCWSBookingsByDate(dateString);

      if (bookingsResponse.success && bookingsResponse.data) {
        const actualBookings = bookingsResponse.data;

        // Generate time slots and map them with actual booking data
        const timeSlots = generateCWSTimeSlotsWithBookings(actualBookings);

        setDayBookings({
          date: dateString,
          bookings: actualBookings,
          timeSlots,
        });
      } else {
        setDayBookings({
          date: dateString,
          bookings: [],
          timeSlots: generateCWSTimeSlotsWithBookings([]),
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching CWS bookings by date:", err);

      const message =
        err instanceof Error ? err.message : "Failed to load bookings";

      if (message.includes("Session expired")) {
        setError("Session expired. Please login again.");
      } else if (message.includes("Invalid access token")) {
        setError("Authentication required. Please login again.");
      } else {
        setError("Failed to load bookings");
      }

      setDayBookings({
        date: date.toISOString().split("T")[0],
        bookings: [],
        timeSlots: generateCWSTimeSlotsWithBookings([]),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookingsForDate(currentDate);
  }, [currentDate, fetchBookingsForDate]);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSlotStatus = (slot: CalendarSlot) => {
    return slot.available ? "available" : "booked";
  };

  const getSlotClasses = (status: string) => {
    const baseClasses = "p-3 rounded-lg border transition-all duration-200";

    switch (status) {
      case "booked":
        return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300`;
      case "available":
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400`;
    }
  };

  if (loading && !dayBookings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Community Work Space Schedule
            </h2>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {formatDate(currentDate)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentDate.toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {dayBookings && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sessions for {formatDate(currentDate)}
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {dayBookings.bookings.length}
                  </span>{" "}
                  booked /{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dayBookings.timeSlots.length}
                  </span>{" "}
                  total (2-hour slots)
                </div>
              </div>
              {dayBookings.bookings.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Total participants:{" "}
                  <span className="font-medium">
                    {dayBookings.bookings.reduce(
                      (total, booking) =>
                        total + parseInt(booking.jumlahPengguna || "0"),
                      0
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* CWS Time Slots - 2-hour sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dayBookings.timeSlots.map((slot) => {
                const status = getSlotStatus(slot);

                return (
                  <div key={slot.hour} className={getSlotClasses(status)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium text-sm">
                          {slot.display}
                        </span>
                      </div>
                      {status === "booked" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          Booked
                        </span>
                      )}
                    </div>

                    {!slot.available && slot.booking ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            {slot.booking.penanggungJawab?.namaLengkap ||
                              "Unknown"}
                          </span>
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {slot.booking.keterangan || "CWS Session"}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            👥 {slot.booking.jumlahPengguna} participants
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              slot.booking.isDone
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {slot.booking.isDone ? "Completed" : "Active"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Available for booking
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-xs mt-6">
              <div className="flex items-center">
                <div className="w-3 h-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Available
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-200 dark:bg-red-800 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Booked</span>
              </div>
            </div>

            {dayBookings.bookings.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookings for this date
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All CWS time slots are available for booking.
                </p>
              </div>
            )}
          </div>
        )}

        {loading && dayBookings && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-lg pointer-events-none">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
