"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { apiClient, ApiError } from "@/lib/api";
import { CommunalBooking, CreateCommunalBookingRequest } from "@/types/api";
import {
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import CommunalBookingForm from "@/components/CommunalBookingForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function CommunalPage() {
  const [bookings, setBookings] = useState<CommunalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<CommunalBooking | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBooking, setDeletingBooking] =
    useState<CommunalBooking | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingsResponse = await apiClient.getCommunalBookings({
        limit: 50,
        sortBy: "waktuMulai",
        sortOrder: "desc",
      });

      let filteredBookings = bookingsResponse.data;
      if (selectedFloor !== "all") {
        filteredBookings = bookingsResponse.data.filter(
          (booking) => booking.lantai === selectedFloor
        );
      }

      setBookings(filteredBookings);
      // Users are no longer needed as we get user info from JWT
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof ApiError ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBooking = async (
    bookingData: CreateCommunalBookingRequest
  ) => {
    try {
      await apiClient.createCommunalBooking(bookingData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  const handleUpdateBooking = async (
    bookingData: CreateCommunalBookingRequest
  ) => {
    if (!editingBooking) return;

    try {
      await apiClient.updateCommunalBooking(editingBooking.id, bookingData);
      setEditingBooking(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error("Error updating booking:", err);
      throw err;
    }
  };

  const handleDeleteBooking = async () => {
    if (!deletingBooking) return;

    try {
      await apiClient.deleteCommunalBooking(deletingBooking.id);
      setShowDeleteModal(false);
      setDeletingBooking(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const openEditForm = (booking: CommunalBooking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const openDeleteModal = (booking: CommunalBooking) => {
    setDeletingBooking(booking);
    setShowDeleteModal(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBooking(null);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getStatusColor = (booking: CommunalBooking) => {
    if (booking.isDone)
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";

    const now = new Date();
    const startTime = new Date(booking.waktuMulai);

    if (startTime < now)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  };

  const getStatusText = (booking: CommunalBooking) => {
    if (booking.isDone) return "Completed";

    const now = new Date();
    const startTime = new Date(booking.waktuMulai);

    if (startTime < now) return "In Progress";
    return "Scheduled";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Communal Room Bookings
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Booking
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Floor:
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const startDateTime = formatDateTime(booking.waktuMulai);
            const endDateTime = formatDateTime(booking.waktuBerakhir);

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      booking
                    )}`}
                  >
                    {getStatusText(booking)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(booking)}
                      className="text-primary hover:text-primary/80"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(booking)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {startDateTime.date} • {startDateTime.time} -{" "}
                      {endDateTime.time}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">Floor {booking.lantai}</span>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {booking.jumlahPengguna} people
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.penanggungJawab.namaLengkap}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.penanggungJawab.nomorWa}
                    </p>
                  </div>

                  {booking.keterangan && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.keterangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {bookings.length === 0 && !loading && (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No bookings
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new booking.
            </p>
          </div>
        )}

        {/* Booking Form Modal */}
        {showForm && (
          <CommunalBookingForm
            booking={editingBooking}
            onSubmit={
              editingBooking ? handleUpdateBooking : handleCreateBooking
            }
            onClose={closeForm}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingBooking && (
          <DeleteConfirmModal
            title="Delete Booking"
            message={`Are you sure you want to delete this booking? This action cannot be undone.`}
            onConfirm={handleDeleteBooking}
            onCancel={() => {
              setShowDeleteModal(false);
              setDeletingBooking(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
