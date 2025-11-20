"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ComponentType,
} from "react";
import {
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  CubeIcon,
  FireIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import type {
  CommunalBooking,
  CWSBooking,
  SerbagunaBooking,
  KitchenBooking,
  WashingMachineBooking,
} from "@/types/api";

type BookingKind =
  | "communal"
  | "cws"
  | "serbaguna"
  | "kitchen"
  | "washingMachineWomen"
  | "washingMachineMen";

interface BookingHistoryItem {
  id: string;
  kind: BookingKind;
  facility: string;
  icon: ComponentType<ComponentProps<"svg">>;
  start: string;
  end: string;
  description?: string;
  location?: string;
  participants?: string;
  status: "completed" | "ongoing" | "upcoming";
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatRange = (start: string, end: string) =>
  `${formatDate(start)} • ${formatTime(start)} - ${formatTime(end)}`;

const determineStatus = (
  startIso: string,
  endIso: string,
  isDone?: boolean
): BookingHistoryItem["status"] => {
  if (isDone) return "completed";
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (end < now) return "completed";
  if (start > now) return "upcoming";
  return "ongoing";
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          communalRes,
          cwsRes,
          serbagunaRes,
          kitchenRes,
          washerWomenRes,
          washerMenRes,
        ] = await Promise.all([
          apiClient.getCommunalBookingsByResponsible(user.id),
          apiClient.getCWSBookingsByResponsiblePerson(user.id),
          apiClient.getSerbagunaBookings({ limit: 100, sortOrder: "desc" }),
          apiClient.getKitchenBookings({ limit: 100, sortOrder: "desc" }),
          apiClient.getWomenWashingMachineBookings({ limit: 100 }),
          apiClient.getMenWashingMachineBookings({ limit: 100 }),
        ]);

        if (cancelled) return;

        const items: BookingHistoryItem[] = [];

        if (communalRes.success && Array.isArray(communalRes.data)) {
          communalRes.data.forEach((booking: CommunalBooking) => {
            items.push({
              id: booking.id,
              kind: "communal",
              facility: "Communal Room",
              icon: BuildingOfficeIcon,
              start: booking.waktuMulai,
              end: booking.waktuBerakhir,
              description: booking.keterangan,
              location: `Floor ${booking.lantai}`,
              participants: `${booking.jumlahPengguna} people`,
              status: determineStatus(
                booking.waktuMulai,
                booking.waktuBerakhir,
                booking.isDone
              ),
            });
          });
        }

        if (cwsRes.success && Array.isArray(cwsRes.data)) {
          cwsRes.data.forEach((booking: CWSBooking) => {
            items.push({
              id: booking.id,
              kind: "cws",
              facility: "CWS",
              icon: BuildingOffice2Icon,
              start: booking.waktuMulai,
              end: booking.waktuBerakhir,
              description: booking.keterangan,
              participants: `${booking.jumlahPengguna} people`,
              status: determineStatus(
                booking.waktuMulai,
                booking.waktuBerakhir,
                booking.isDone
              ),
            });
          });
        }

        if (serbagunaRes.success && Array.isArray(serbagunaRes.data)) {
          serbagunaRes.data
            .filter((booking: SerbagunaBooking) => booking.idPenanggungJawab === user.id)
            .forEach((booking: SerbagunaBooking) => {
              items.push({
                id: booking.id,
                kind: "serbaguna",
                facility: "Serbaguna Area",
                icon: CubeIcon,
                start: booking.waktuMulai,
                end: booking.waktuBerakhir,
                description: booking.keterangan,
                location: booking.area?.namaArea,
                participants: `${booking.jumlahPengguna} people`,
                status: determineStatus(
                  booking.waktuMulai,
                  booking.waktuBerakhir,
                  booking.isDone
                ),
              });
            });
        }

        if (kitchenRes.success && Array.isArray(kitchenRes.data)) {
          kitchenRes.data
            .filter((booking: KitchenBooking) => booking.idPeminjam === user.id)
            .forEach((booking: KitchenBooking) => {
              items.push({
                id: booking.id,
                kind: "kitchen",
                facility: "Kitchen",
                icon: FireIcon,
                start: booking.waktuMulai,
                end: booking.waktuBerakhir,
                description: booking.fasilitas?.fasilitas,
                status: determineStatus(booking.waktuMulai, booking.waktuBerakhir),
              });
            });
        }

        if (washerWomenRes.success && Array.isArray(washerWomenRes.data)) {
          washerWomenRes.data
            .filter((booking: WashingMachineBooking) => booking.idPeminjam === user.id)
            .forEach((booking: WashingMachineBooking) => {
              items.push({
                id: booking.id,
                kind: "washingMachineWomen",
                facility: "Washing Machine",
                icon: Cog6ToothIcon,
                start: booking.waktuMulai,
                end: booking.waktuBerakhir,
                description: booking.fasilitas?.nama,
                status: determineStatus(booking.waktuMulai, booking.waktuBerakhir),
              });
            });
        }
        if (washerMenRes.success && Array.isArray(washerMenRes.data)) {
          washerMenRes.data
            .filter((booking: WashingMachineBooking) => booking.idPeminjam === user.id)
            .forEach((booking: WashingMachineBooking) => {
              items.push({
                id: booking.id,
                kind: "washingMachineMen",
                facility: "Washing Machine",
                icon: Cog6ToothIcon,
                start: booking.waktuMulai,
                end: booking.waktuBerakhir,
                description: booking.fasilitas?.nama,
                status: determineStatus(booking.waktuMulai, booking.waktuBerakhir),
              });
            });
        }

        items.sort(
          (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
        );

        setHistory(items);
      } catch (err) {
        console.error("Failed to load booking history:", err);
        if (!cancelled) {
          setError("Failed to load booking history.");
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const upcomingBookings = useMemo(
    () =>
      history
        .filter((item) => item.status !== "completed")
        .sort(
          (a, b) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        ),
    [history]
  );

  const pastBookings = useMemo(
    () =>
      history
        .filter((item) => item.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.start).getTime() - new Date(a.start).getTime()
        ),
    [history]
  );

  const totalBookings = history.length;
  const upcomingCount = upcomingBookings.length;
  const pastSevenDays = useMemo(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return history.filter((item) => new Date(item.start) >= threshold).length;
  }, [history]);

  const handleCancelBooking = async (booking: BookingHistoryItem) => {
    if (booking.status !== "upcoming") return;

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    setCancellingId(booking.id);
    setError(null);

    try {
      switch (booking.kind) {
        case "communal":
          await apiClient.deleteCommunalBooking(booking.id);
          break;
        case "cws":
          await apiClient.deleteCWSBooking(booking.id);
          break;
        case "serbaguna":
          await apiClient.deleteSerbagunaBooking(booking.id);
          break;
        case "kitchen":
          await apiClient.deleteKitchenBooking(booking.id);
          break;
        case "washingMachineWomen":
          await apiClient.deleteWomenWashingMachineBooking(booking.id);
          break;
        case "washingMachineMen":
          await apiClient.deleteMenWashingMachineBooking(booking.id);
          break;
        default:
          throw new Error("Unsupported booking type");
      }

      setHistory((prev) => prev.filter((item) => item.id !== booking.id));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground">
                Personal details and account information
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="text-foreground font-medium">{user.namaLengkap}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Preferred Name</p>
                <p className="text-foreground font-medium">{user.namaPanggilan}</p>
              </div>
              <div>
                <p className="text-muted-foreground">WhatsApp</p>
                <p className="text-foreground font-medium">{user.nomorWa}</p>
              </div>
              {user.angkatan?.namaAngkatan && (
                <div>
                  <p className="text-muted-foreground">Angkatan</p>
                  <p className="text-foreground font-medium">
                    {user.angkatan.namaAngkatan}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">
              Booking Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalBookings}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-semibold text-foreground">
                  {upcomingCount}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-muted-foreground">Past 7 Days</p>
                <p className="text-2xl font-semibold text-foreground">
                  {pastSevenDays}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming & Ongoing Bookings
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading...
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && upcomingBookings.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No upcoming bookings yet.
            </div>
          ) : (
            <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div
              key={`upcoming-${booking.id}-${booking.start}`}
              className="rounded-lg border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <booking.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {booking.facility}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatRange(booking.start, booking.end)}
                        </p>
                        {booking.location && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            📍 {booking.location}
                          </p>
                        )}
                        {booking.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.description}
                          </p>
                        )}
                        {booking.participants && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            👥 {booking.participants}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === "ongoing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {booking.status === "ongoing" ? "Ongoing" : "Upcoming"}
                      </span>
                      {booking.status === "upcoming" && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Cancel booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Past Bookings
          </h2>
          {pastBookings.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No past bookings recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={`history-${booking.id}-${booking.start}`}
                  className="rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className="flex items-start space-x-3">
                    <booking.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {booking.facility}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatRange(booking.start, booking.end)}
                      </p>
                      {booking.location && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          📍 {booking.location}
                        </p>
                      )}
                      {booking.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {booking.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
