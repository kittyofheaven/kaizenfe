"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewKitchenBookingModal from "@/components/NewKitchenBookingModal";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  ClockIcon,
  CalendarDaysIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { KitchenBooking, KitchenFacility } from "@/types/api";

export default function KitchenPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<KitchenBooking[]>([]);
  const [facilities, setFacilities] = useState<KitchenFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch bookings and facilities
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, facilitiesResponse] = await Promise.all([
        apiClient.getKitchenBookings(),
        apiClient.getKitchenFacilities(),
      ]);

      if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
        setBookings(bookingsResponse.data);
      } else {
        setBookings([]);
      }

      if (facilitiesResponse.success && Array.isArray(facilitiesResponse.data)) {
        setFacilities(facilitiesResponse.data);
      } else {
        setFacilities([]);
      }
    } catch (error) {
      console.error("Error fetching kitchen data:", error);
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
  const now = Date.now();
  const activeBookings = bookings.filter((booking) => {
    const endTime = new Date(booking.waktuBerakhir).getTime();
    return endTime > now;
  }).length;
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
                <WrenchScrewdriverIcon className="h-8 w-8 mr-3 text-primary" />
                Kitchen Facilities
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Book kitchen facilities for cooking and food preparation (1-hour
                sessions)
              </p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Book Facility
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
                <FireIcon className="h-8 w-8 text-orange-500" />
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
                <WrenchScrewdriverIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Facilities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : facilities.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Facilities */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-primary" />
              Available Facilities
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Loading facilities...
                </p>
              </div>
            ) : facilities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-center">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {facility.fasilitas}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Kitchen Facility
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No facilities available
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
                {bookings.slice(0, 5).map((booking) => {
                  const isCompleted =
                    new Date(booking.waktuBerakhir).getTime() <= Date.now();

                  return (
                    <div
                      key={booking.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {booking.peminjam?.namaLengkap || "Unknown"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.fasilitas?.fasilitas || "Unknown Facility"}
                        </p>
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
                            isCompleted
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Upcoming"}
                        </span>
                        {booking.pinjamPeralatan && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            Equipment Rented
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No bookings yet. Be the first to book a facility!
              </p>
            )}
          </div>

          {/* Booking Modal */}
          <NewKitchenBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
