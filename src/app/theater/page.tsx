"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewTheaterBookingModal from "@/components/NewTheaterBookingModal";
import { apiClient } from "@/lib/api";
import { TheaterBooking } from "@/types/api";
import {
  VideoCameraIcon,
  PlusIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getBookingDateKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return formatDateInput(date);
};

export default function TheaterPage() {
  const [bookings, setBookings] = useState<TheaterBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(formatDateInput(new Date()));

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTheaterBookings({
        limit: 100,
        sortBy: "waktuMulai",
        sortOrder: "desc",
      });

      if (response.success && Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching theater bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const stats = useMemo(() => {
    const now = new Date();

    const total = bookings.length;
    const upcoming = bookings.filter(
      (booking) => new Date(booking.waktuMulai) > now && !booking.isDone
    ).length;
    const completed = bookings.filter((booking) => booking.isDone).length;
    const today = bookings.filter((booking) => {
      const bookingDate = new Date(booking.waktuMulai).toDateString();
      return bookingDate === now.toDateString();
    }).length;

    return {
      total,
      upcoming,
      completed,
      today,
    };
  }, [bookings]);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (booking: TheaterBooking) => {
    if (booking.isDone) {
      return { label: "Completed", color: "bg-green-100 text-green-800" };
    }

    const now = new Date();
    const start = new Date(booking.waktuMulai);
    const end = new Date(booking.waktuBerakhir);

    if (end < now) {
      return { label: "Past", color: "bg-gray-200 text-gray-700" };
    }

    if (start <= now && end >= now) {
      return { label: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    }

    return { label: "Scheduled", color: "bg-blue-100 text-blue-800" };
  };

  const scheduleEntries = useMemo(() => {
    const entries = bookings.filter((booking) => {
      const bookingDate = getBookingDateKey(booking.waktuMulai);
      return bookingDate === scheduleDate;
    });

    return entries.sort((a, b) => {
      return (
        new Date(a.waktuMulai).getTime() - new Date(b.waktuMulai).getTime()
      );
    });
  }, [bookings, scheduleDate]);

  const changeScheduleDate = (days: number) => {
    const base = new Date(`${scheduleDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) {
      setScheduleDate(formatDateInput(new Date()));
      return;
    }

    base.setDate(base.getDate() + days);
    setScheduleDate(formatDateInput(base));
  };

  const scheduleDateLabel = useMemo(() => {
    const date = new Date(`${scheduleDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [scheduleDate]);

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="h-10 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center text-3xl font-bold text-gray-900 dark:text-white">
                <VideoCameraIcon className="mr-3 h-8 w-8 text-primary" />
                Theater Bookings
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage theater reservations, monitor status, and check slot availability.
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              New Theater Booking
            </button>
          </div>

          {/* Stats */}
          {loading ? (
            renderSkeleton()
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Today&apos;s Bookings
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.today}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Upcoming Sessions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.upcoming}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking List */}
          <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Theater Bookings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overview of the latest requests and their statuses.
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No theater bookings yet. Create one to get started!
                </div>
              ) : (
                bookings.map((booking) => {
                  const status = getStatus(booking);
                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {formatDate(booking.waktuMulai)}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatTime(booking.waktuMulai)} - {formatTime(booking.waktuBerakhir)} WIB
                        </span>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {booking.keterangan || "No description provided"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>
                            {booking.jumlahPengguna} participants · Responsible: {" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {booking.penanggungJawab.namaLengkap}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>Created {formatDate(booking.createdAt)}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Schedule
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View who will use the theater and the purpose of each session.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeScheduleDate(-1)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                      setScheduleDate(value);
                    } else {
                      setScheduleDate(formatDateInput(new Date()));
                    }
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => changeScheduleDate(1)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <ClockIcon className="h-5 w-5 text-primary" />
                <span>{scheduleDateLabel}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {scheduleEntries.length} session
                  {scheduleEntries.length === 1 ? "" : "s"}
                </span>
              </div>

              {scheduleEntries.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                  No bookings scheduled for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduleEntries.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatTime(booking.waktuMulai)} - {formatTime(booking.waktuBerakhir)} WIB
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          #{booking.id}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4 text-primary" />
                          <span>
                            {booking.penanggungJawab.namaLengkap} · {booking.jumlahPengguna} peserta
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <DocumentTextIcon className="mt-1 h-4 w-4 text-accent" />
                          <span className="leading-relaxed">
                            {booking.keterangan || "Tidak ada keterangan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showBookingModal && (
          <NewTheaterBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingSuccess={fetchBookings}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
