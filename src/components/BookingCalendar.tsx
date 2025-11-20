"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { TimeSlot as ApiTimeSlot } from "@/types/api";
import { WashingMachineFacility } from "@/types/api";
import { apiClient } from "@/lib/api";

interface BookingCalendarProps {
  type: "women" | "men";
  title: string;
}

interface CalendarSlot {
  hour: number;
  display: string;
  available: boolean;
}

interface DayBooking {
  date: string;
  timeSlots: CalendarSlot[];
}

export default function BookingCalendar({ type, title }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayBookings, setDayBookings] = useState<DayBooking | null>(null);
  const [facilities, setFacilities] = useState<WashingMachineFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookedCount = dayBookings
    ? dayBookings.timeSlots.filter((slot) => !slot.available).length
    : 0;
  const availableCount = dayBookings
    ? dayBookings.timeSlots.filter((slot) => slot.available).length
    : 0;

  // Generate time slots from 0:00 to 23:00 (24 hours)
  const generateTimeSlots = (timeSlotData: ApiTimeSlot[]): CalendarSlot[] => {
    const slots: CalendarSlot[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const startHourStr = hour.toString().padStart(2, "0");
      const endHourStr = ((hour + 1) % 24).toString().padStart(2, "0");

      const apiSlot = timeSlotData.find((slot) => {
        const slotStart = new Date(slot.waktuMulai);
        return slotStart.getHours() === hour;
      });

      slots.push({
        hour,
        display: `${startHourStr}:00 - ${endHourStr}:00`,
        available: apiSlot ? apiSlot.available !== false : true,
      });
    }

    return slots;
  };

  // Fetch facilities when component mounts
  const fetchFacilities = useCallback(async () => {
    try {
      const response =
        type === "women"
          ? await apiClient.getWomenWashingMachineFacilities()
          : await apiClient.getMenWashingMachineFacilities();

      if (response.success) {
        const facilityList = Array.isArray(response.data)
          ? response.data
          : [];

        setFacilities(facilityList);
        setSelectedFacility((current) => {
          if (current && facilityList.some((facility) => facility.id === current)) {
            return current;
          }
          return facilityList.length > 0 ? facilityList[0].id : null;
        });
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.error("Error fetching facilities:", err);
    }
  }, [type]);

  const fetchBookingsForDate = useCallback(
    async (date: Date) => {
      if (!selectedFacility) return;

      setLoading(true);
      setError(null);

      try {
        const dateString = date.toISOString().split("T")[0];

        const endpoint =
          type === "women"
            ? `/api/v1/mesin-cuci-cewe/time-slots?date=${dateString}&facilityId=${selectedFacility}`
            : `/api/v1/mesin-cuci-cowo/time-slots?date=${dateString}&facilityId=${selectedFacility}`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          setError("Authentication required. Please login again.");
          return;
        }

        const result: { success: boolean; data?: ApiTimeSlot[] } =
          await response.json();

        if (result.success && Array.isArray(result.data)) {
          const timeSlots = generateTimeSlots(result.data);
          setDayBookings({
            date: dateString,
            timeSlots,
          });
        } else {
          setDayBookings({
            date: dateString,
            timeSlots: generateTimeSlots([]),
          });
        }
      } catch (err: unknown) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load time slots");
        setDayBookings({
          date: date.toISOString().split("T")[0],
          timeSlots: generateTimeSlots([]),
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedFacility, type]
  );

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    if (selectedFacility) {
      fetchBookingsForDate(currentDate);
    }
  }, [currentDate, fetchBookingsForDate, selectedFacility]);

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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

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
            {[...Array(6)].map((_, i) => (
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
              {title} Schedule
            </h2>

            {/* Facility Selector */}
            {facilities.length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Machine:
                </label>
                <select
                  value={selectedFacility || ""}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {dayBookings && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Booked:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookedCount}
                  </span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Available Slots:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {availableCount}
                  </span>
                </span>
              </div>
            </div>

            {/* Time Slots - 24 hours grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

                    {!slot.available ? (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium">Reserved</span>
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Unavailable
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Available
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

            {bookedCount === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookings for this date
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All time slots are available for booking.
                </p>
              </div>
            )}
          </div>
        )}

        {loading && dayBookings && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
