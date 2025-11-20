"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import WashingMachineCard from "@/components/WashingMachineCard";
import NewWashingMachineBookingModal from "@/components/NewWashingMachineBookingModal";
import BookingCalendar from "@/components/BookingCalendar";
import { apiClient } from "@/lib/api";
import { WashingMachineBooking, WashingMachineFacility } from "@/types/api";

export default function WashingMachinePage() {
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [womenBookings, setWomenBookings] = useState<WashingMachineBooking[]>(
    []
  );
  const [menBookings, setMenBookings] = useState<WashingMachineBooking[]>([]);
  const [womenFacilities, setWomenFacilities] = useState<
    WashingMachineFacility[]
  >([]);
  const [menFacilities, setMenFacilities] = useState<WashingMachineFacility[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] =
    useState<WashingMachineFacility | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🧺 Starting to fetch washing machine data...");
        setLoading(true);

        console.log("📡 Making API calls...");
        const [
          womenBookingsRes,
          menBookingsRes,
          womenFacilitiesRes,
          menFacilitiesRes,
        ] = await Promise.all([
          apiClient.getWomenWashingMachineBookings({ limit: 50 }),
          apiClient.getMenWashingMachineBookings({ limit: 50 }),
          apiClient.getWomenWashingMachineFacilities(),
          apiClient.getMenWashingMachineFacilities(),
        ]);

        console.log("✅ Women bookings:", womenBookingsRes);
        console.log("✅ Men bookings:", menBookingsRes);
        console.log("✅ Women facilities:", womenFacilitiesRes);
        console.log("✅ Men facilities:", menFacilitiesRes);

        setWomenBookings(
          womenBookingsRes.success && Array.isArray(womenBookingsRes.data)
            ? womenBookingsRes.data
            : []
        );
        setMenBookings(
          menBookingsRes.success && Array.isArray(menBookingsRes.data)
            ? menBookingsRes.data
            : []
        );
        setWomenFacilities(
          womenFacilitiesRes.success && Array.isArray(womenFacilitiesRes.data)
            ? womenFacilitiesRes.data
            : []
        );
        setMenFacilities(
          menFacilitiesRes.success && Array.isArray(menFacilitiesRes.data)
            ? menFacilitiesRes.data
            : []
        );

        console.log("🏁 Successfully loaded washing machine data");
      } catch (error) {
        console.error("❌ Error fetching washing machine data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMachineClick = (facility: WashingMachineFacility) => {
    console.log("Selected machine:", facility);
    setSelectedFacility(facility);
    // View details functionality can be added here
  };

  const handleBookNow = (facility: WashingMachineFacility) => {
    console.log("Booking machine:", facility);
    setSelectedFacility(facility);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    console.log("🎉 Booking successful! Refreshing data...");
    // Refresh the data after successful booking
    try {
      const [
        womenBookingsRes,
        menBookingsRes,
        womenFacilitiesRes,
        menFacilitiesRes,
      ] = await Promise.all([
        apiClient.getWomenWashingMachineBookings({ limit: 50 }),
        apiClient.getMenWashingMachineBookings({ limit: 50 }),
        apiClient.getWomenWashingMachineFacilities(),
        apiClient.getMenWashingMachineFacilities(),
      ]);

      setWomenBookings(
        womenBookingsRes.success && Array.isArray(womenBookingsRes.data)
          ? womenBookingsRes.data
          : []
      );
      setMenBookings(
        menBookingsRes.success && Array.isArray(menBookingsRes.data)
          ? menBookingsRes.data
          : []
      );
      setWomenFacilities(
        womenFacilitiesRes.success && Array.isArray(womenFacilitiesRes.data)
          ? womenFacilitiesRes.data
          : []
      );
      setMenFacilities(
        menFacilitiesRes.success && Array.isArray(menFacilitiesRes.data)
          ? menFacilitiesRes.data
          : []
      );
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    }
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
      <div className="space-y-8">
        <section className="card relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/15" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="pill text-xs text-primary">
                  Washing Machine
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Washing Machine Booking
                </h1>
                <p className="text-sm text-muted-foreground">
                  Book your preferred washing machine slot.
                </p>
              </div>

              <div className="rounded-full border border-border/80 bg-background/70 p-1 flex">
                <button
                  onClick={() => setActiveTab("women")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition duration-200 ${
                    activeTab === "women"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Women&apos;s Section
                </button>
                <button
                  onClick={() => setActiveTab("men")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition duration-200 ${
                    activeTab === "men"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Men&apos;s Section
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Women&apos;s Machines
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {womenFacilities.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Men&apos;s Machines
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {menFacilities.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Active Bookings
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {womenBookings.filter(
                    (b) => new Date(b.waktuBerakhir) > new Date()
                  ).length +
                    menBookings.filter(
                      (b) => new Date(b.waktuBerakhir) > new Date()
                    ).length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Available Now
                </p>
                <p className="text-2xl font-semibold text-success">
                  {womenFacilities.length +
                    menFacilities.length -
                    womenBookings.filter(
                      (b) =>
                        new Date(b.waktuMulai) <= new Date() &&
                        new Date(b.waktuBerakhir) > new Date()
                    ).length -
                    menBookings.filter(
                      (b) =>
                        new Date(b.waktuMulai) <= new Date() &&
                        new Date(b.waktuBerakhir) > new Date()
                    ).length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="card p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeTab === "women" ? womenFacilities : menFacilities).map(
              (facility) => (
                <WashingMachineCard
                  key={facility.id}
                  facility={facility}
                  bookings={activeTab === "women" ? womenBookings : menBookings}
                  onClick={() => handleMachineClick(facility)}
                  onBookNow={() => handleBookNow(facility)}
                />
              )
            )}
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <BookingCalendar
            type={activeTab}
            title={`${
              activeTab === "women" ? "Women&apos;s" : "Men&apos;s"
            } Washing Machine`}
          />
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg border border-border/70 bg-background/70 backdrop-blur">
              <div className="text-3xl font-bold text-foreground mb-2">
                {womenFacilities.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Women&apos;s Machines
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border border-border/70 bg-background/70 backdrop-blur">
              <div className="text-3xl font-bold text-foreground mb-2">
                {menFacilities.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Men&apos;s Machines
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border border-border/70 bg-background/70 backdrop-blur">
              <div className="text-3xl font-bold text-primary mb-2">
                {womenBookings.filter(
                  (b) => new Date(b.waktuBerakhir) > new Date()
                ).length +
                  menBookings.filter(
                    (b) => new Date(b.waktuBerakhir) > new Date()
                  ).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Bookings
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border border-border/70 bg-background/70 backdrop-blur">
              <div className="text-3xl font-bold text-success mb-2">
                {womenFacilities.length +
                  menFacilities.length -
                  womenBookings.filter(
                    (b) =>
                      new Date(b.waktuMulai) <= new Date() &&
                      new Date(b.waktuBerakhir) > new Date()
                  ).length -
                  menBookings.filter(
                    (b) =>
                      new Date(b.waktuMulai) <= new Date() &&
                      new Date(b.waktuBerakhir) > new Date()
                  ).length}
              </div>
              <div className="text-sm text-muted-foreground">Available Now</div>
            </div>
          </div>
        </div>

        <NewWashingMachineBookingModal
          facility={selectedFacility}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedFacility(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </Layout>
  );
}
