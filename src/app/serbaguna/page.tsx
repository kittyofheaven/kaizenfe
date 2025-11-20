"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewSerbagunaBookingModal from "@/components/NewSerbagunaBookingModal";
import SerbagunaBookingCalendar from "@/components/SerbagunaBookingCalendar";
import {
  BuildingOffice2Icon,
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BuildingOffice2Icon className="h-8 w-8 mr-3 text-primary" />
                Serbaguna Area
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Book the serbaguna area for various activities and events
                (2-hour sessions)
              </p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Book Area
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : totalBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : activeBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Today&apos;s Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : todayBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <MapPinIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Areas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : areas.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Serbaguna Calendar */}
          <SerbagunaBookingCalendar areas={areas} />

          {/* Available Areas */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-primary" />
              Available Areas
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Loading areas...
                </p>
              </div>
            ) : areas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {area.namaArea}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Serbaguna Area
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No areas available
              </p>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" />
              Recent Bookings
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {booking.penanggungJawab?.namaLengkap || "Unknown"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.isDone
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          }`}
                        >
                          {booking.isDone ? "Completed" : "Active"}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {booking.jumlahPengguna} participants
                        </p>
                      </div>
                    </div>
                    {booking.keterangan && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {booking.keterangan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No bookings yet. Be the first to book an area!
              </p>
            )}
          </div>

          {/* Booking Modal */}
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
