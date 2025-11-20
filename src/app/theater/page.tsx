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
      return { label: "Completed", color: "bg-success/20 text-success" };
    }

    const now = new Date();
    const start = new Date(booking.waktuMulai);
    const end = new Date(booking.waktuBerakhir);

    if (end < now) {
      return { label: "Past", color: "bg-muted text-muted-foreground" };
    }

    if (start <= now && end >= now) {
      return { label: "In Progress", color: "bg-warning/20 text-warning" };
    }

    return { label: "Scheduled", color: "bg-primary/20 text-primary" };
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
      <div className="h-10 w-64 rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <section className="card relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/15" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="pill text-xs text-primary">Theater</div>
                <h1 className="flex items-center text-3xl font-bold text-foreground">
                  <VideoCameraIcon className="mr-3 h-8 w-8 text-primary" />
                  Theater Bookings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage theater reservations, monitor status, and check slot availability.
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                New Theater Booking
              </button>
            </div>
          </section>

          {loading ? (
            renderSkeleton()
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="card p-5">
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Total Bookings
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Today&apos;s Bookings
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {stats.today}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Upcoming Sessions
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {stats.upcoming}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Completed
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {stats.completed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Recent Theater Bookings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Overview of the latest requests and their statuses.
                    </p>
                  </div>
                  <span className="pill text-xs text-muted-foreground">
                    Live list
                  </span>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="rounded-xl border border-border/70 bg-background/70 p-6 text-center text-muted-foreground">
                      No theater bookings yet. Create one to get started!
                    </div>
                  ) : (
                    bookings.map((booking) => {
                      const status = getStatus(booking);
                      return (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-border/70 bg-background/70 p-5 backdrop-blur transition hover:-translate-y-0.5"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                {formatDate(booking.waktuMulai)}
                              </p>
                              <p className="text-lg font-semibold text-foreground">
                                {formatTime(booking.waktuMulai)} -{" "}
                                {formatTime(booking.waktuBerakhir)} WIB
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {booking.keterangan || "No description provided"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-4 w-4 text-primary" />
                                <span>
                                  {booking.jumlahPengguna} participants · Responsible:{" "}
                                  <span className="font-semibold text-foreground">
                                    {booking.penanggungJawab.namaLengkap}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-accent" />
                                <span>Created {formatDate(booking.createdAt)}</span>
                              </div>
                            </div>
                            <span
                              className={`pill inline-flex h-8 items-center justify-center text-xs font-semibold ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Daily Schedule
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View who will use the theater and the purpose of each session.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeScheduleDate(-1)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
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
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => changeScheduleDate(1)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ClockIcon className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{scheduleDateLabel}</span>
                    <span className="pill text-xs">
                      {scheduleEntries.length} session
                      {scheduleEntries.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {scheduleEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                      No bookings scheduled for this date.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduleEntries.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur transition hover:-translate-y-0.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-base font-semibold text-foreground">
                              {formatTime(booking.waktuMulai)} -{" "}
                              {formatTime(booking.waktuBerakhir)} WIB
                            </span>
                            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              #{booking.id}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className="h-4 w-4 text-primary" />
                              <span className="text-foreground">
                                {booking.penanggungJawab.namaLengkap} ·{" "}
                                {booking.jumlahPengguna} peserta
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <DocumentTextIcon className="mt-1 h-4 w-4 text-accent" />
                              <span className="leading-relaxed text-foreground">
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
            </>
          )}
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
