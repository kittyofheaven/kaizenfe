"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NewCWSBookingModal from "@/components/NewCWSBookingModal";
import CWSBookingCalendar from "@/components/CWSBookingCalendar";
import { apiClient } from "@/lib/api";
import { CWSBooking } from "@/types/api";
import {
  BuildingOffice2Icon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export default function CWSPage() {
  const [bookings, setBookings] = useState<CWSBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await apiClient.getCWSBookings({ limit: 50 });

      console.log("✅ CWS bookings:", bookingsRes);

      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      } else {
        console.error("❌ Failed to fetch CWS bookings:", bookingsRes);
        setBookings([]);
      }
    } catch (error) {
      console.error("❌ Error fetching CWS data:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingSuccess = () => {
    fetchData(); // Refresh data after successful booking
    setIsBookingModalOpen(false);
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((booking) => !booking.isDone).length;
  const todayBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.waktuMulai).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  }).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-80">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <section className="card relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/15" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="pill text-xs text-primary">
                Community Work Space
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Community Work Space
              </h1>
              <p className="text-sm text-muted-foreground">
                Book and manage your collaborative workspace sessions.
              </p>
            </div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Book CWS
            </button>
          </div>
          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalBookings}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Active
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {activeBookings}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Today
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {todayBookings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="card p-6 md:p-8">
          <CWSBookingCalendar />
        </div>

        <div className="card p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Recent Bookings
              </h3>
              <p className="text-sm text-muted-foreground">
                Pantau booking terakhir dan statusnya.
              </p>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <BuildingOffice2Icon className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No bookings yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by booking your first CWS session.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Book CWS Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {booking.penanggungJawab?.namaLengkap || "Unknown"}
                        </h4>
                        <span
                          className={`pill text-xs ${
                            booking.isDone
                              ? "bg-success/20 text-success"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {booking.isDone ? "Completed" : "Active"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.waktuMulai).toLocaleDateString()} ·{" "}
                        {new Date(booking.waktuMulai).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        to{" "}
                        {new Date(booking.waktuBerakhir).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.jumlahPengguna} participants ·{" "}
                        {booking.keterangan}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isBookingModalOpen ? (
          <NewCWSBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        ) : null}
      </div>
    </Layout>
  );
}
