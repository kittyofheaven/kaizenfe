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

      if (bookingsRes.success && bookingsRes.data) {
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BuildingOffice2Icon className="h-8 w-8 mr-3 text-primary" />
                  Community Work Space
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Book and manage your collaborative workspace sessions
                </p>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Book CWS
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Bookings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {totalBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {activeBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Today's Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {todayBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CWS Booking Calendar */}
          <div className="mb-8">
            <CWSBookingCalendar />
          </div>

          {/* Recent Bookings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Bookings
              </h3>
            </div>
            <div className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start by booking your first CWS session.
                  </p>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
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
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.penanggungJawab?.namaLengkap || "Unknown"}
                          </h4>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.isDone
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }`}
                          >
                            {booking.isDone ? "Completed" : "Active"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(booking.waktuMulai).toLocaleDateString()} -{" "}
                          {new Date(booking.waktuMulai).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          to{" "}
                          {new Date(booking.waktuBerakhir).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {booking.jumlahPengguna} participants -{" "}
                          {booking.keterangan}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CWS Booking Modal */}
        {isBookingModalOpen && (
          <NewCWSBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
