"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewSerbagunaBookingModal from "@/components/NewSerbagunaBookingModal";
import SerbagunaBookingCalendar from "@/components/SerbagunaBookingCalendar";
import {
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { SerbagunaBooking, SerbagunaArea } from "@/types/api";

export default function SerbagunaPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<SerbagunaBooking[]>([]);
  const [areas, setAreas] = useState<SerbagunaArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch bookings and areas
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, areasResponse] = await Promise.all([
        apiClient.getSerbagunaBookings(),
        apiClient.getSerbagunaAreas(),
      ]);

      if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
        setBookings(bookingsResponse.data);
      } else {
        setBookings([]);
      }

      if (areasResponse.success && Array.isArray(areasResponse.data)) {
        setAreas(areasResponse.data);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Error fetching serbaguna data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleBookingSuccess = () => {
    fetchData(); // Refresh data after successful booking
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((booking) => !booking.isDone).length;
  const todayBookings = bookings.filter((booking) => {
    const today = new Date().toISOString().split("T")[0];
    const bookingDate = new Date(booking.waktuMulai)
      .toISOString()
      .split("T")[0];
    return bookingDate === today;
  }).length;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <section className="card relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/15" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="pill text-xs text-primary">Serbaguna Area</div>
                <h1 className="text-3xl font-bold text-foreground">
                  Serbaguna Area
                </h1>
                <p className="text-sm text-muted-foreground">
                  Book the serbaguna area for various activities and events
                  (2-hour sessions).
                </p>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Book Area
              </button>
            </div>

            <div className="relative mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Total
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {loading ? "..." : totalBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Active
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {loading ? "..." : activeBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Today
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {loading ? "..." : todayBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Areas
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {loading ? "..." : areas.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="card p-6 md:p-8">
            <SerbagunaBookingCalendar areas={areas} />
          </div>

          <div className="card p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPinIcon className="h-5 w-5 text-primary" />
              Available Areas
            </div>
            {loading ? (
              <div className="text-center py-6">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading areas...
                </p>
              </div>
            ) : areas.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary"
                  >
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {area.namaArea}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Serbaguna Area
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No areas available
              </p>
            )}
          </div>

          <div className="card p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarDaysIcon className="h-5 w-5 text-primary" />
              Recent Bookings
            </div>
            {loading ? (
              <div className="text-center py-6">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {booking.penanggungJawab?.namaLengkap || "Unknown"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.waktuMulai).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.waktuMulai).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(booking.waktuBerakhir).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`pill text-xs ${
                            booking.isDone
                              ? "bg-success/20 text-success"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {booking.isDone ? "Completed" : "Active"}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.jumlahPengguna} participants
                        </p>
                      </div>
                    </div>
                    {booking.keterangan ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        {booking.keterangan}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No bookings yet. Be the first to book an area!
              </p>
            )}
          </div>

          <NewSerbagunaBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
