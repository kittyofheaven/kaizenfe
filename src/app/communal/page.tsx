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
    if (booking.isDone) return "bg-success/20 text-success";

    const now = new Date();
    const startTime = new Date(booking.waktuMulai);

    if (startTime < now) return "bg-warning/20 text-warning";
    return "bg-primary/20 text-primary";
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
        <div className="flex items-center justify-center h-80">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const now = new Date().getTime();
  const activeCount = bookings.filter(
    (booking) => !booking.isDone && new Date(booking.waktuBerakhir).getTime() > now
  ).length;
  const upcomingCount = bookings.filter(
    (booking) => new Date(booking.waktuMulai).getTime() > now
  ).length;

  return (
    <Layout>
      <div className="space-y-8">
        <section className="card relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/15" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="pill text-xs text-primary">Communal Room</div>
              <h1 className="text-3xl font-bold text-foreground">
                Communal Room Bookings
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola booking ruang komunal dengan cepat, pantau status, dan
                filter berdasarkan lantai.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="pill">Slot 1 jam</span>
                <span className="pill">Urut by waktu mulai</span>
                <span className="pill">Mulai / edit / hapus langsung</span>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="input min-w-[160px] bg-background/70"
              >
                <option value="all">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Booking
              </button>
            </div>
          </div>
          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-foreground">
                {activeCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-semibold text-foreground">
                {upcomingCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold text-foreground">
                {bookings.length}
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => {
            const startDateTime = formatDateTime(booking.waktuMulai);
            const endDateTime = formatDateTime(booking.waktuBerakhir);

            return (
              <div
                key={booking.id}
                className="card relative overflow-hidden p-6 transition duration-200 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/12" />
                <div className="relative flex items-center justify-between">
                  <span
                    className={`pill text-xs font-semibold ${getStatusColor(
                      booking
                    )}`}
                  >
                    {getStatusText(booking)}
                  </span>
                  <div className="flex space-x-2 text-sm">
                    <button
                      onClick={() => openEditForm(booking)}
                      className="rounded-lg border border-border/80 bg-background/60 px-3 py-1 text-foreground transition hover:border-primary hover:text-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(booking)}
                      className="rounded-lg border border-border/80 bg-background/60 px-3 py-1 text-destructive transition hover:border-destructive hover:text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="relative mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {startDateTime.date} • {startDateTime.time} -{" "}
                      {endDateTime.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-accent" />
                    <span className="text-foreground">
                      Floor {booking.lantai}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {booking.jumlahPengguna} people
                    </span>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-semibold text-foreground">
                      {booking.penanggungJawab.namaLengkap}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.penanggungJawab.nomorWa}
                    </p>
                  </div>
                  {booking.keterangan ? (
                    <div className="rounded-lg border border-border/70 bg-background/60 p-3 text-foreground">
                      {booking.keterangan}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {bookings.length === 0 && !loading ? (
          <div className="card relative overflow-hidden p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-accent/12" />
            <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-3 text-lg font-semibold text-foreground">
              No bookings
            </h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating a new booking.
            </p>
          </div>
        ) : null}

        {showForm ? (
          <CommunalBookingForm
            booking={editingBooking}
            onSubmit={
              editingBooking ? handleUpdateBooking : handleCreateBooking
            }
            onClose={closeForm}
          />
        ) : null}

        {showDeleteModal && deletingBooking ? (
          <DeleteConfirmModal
            title="Delete Booking"
            message={`Are you sure you want to delete this booking? This action cannot be undone.`}
            onConfirm={handleDeleteBooking}
            onCancel={() => {
              setShowDeleteModal(false);
              setDeletingBooking(null);
            }}
          />
        ) : null}
      </div>
    </Layout>
  );
}
