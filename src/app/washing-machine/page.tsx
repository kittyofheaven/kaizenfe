"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import WashingMachineLayout from "@/components/WashingMachineLayout";
import { apiClient } from "@/lib/api";
import { WashingMachineBooking, WashingMachineFacility } from "@/types/api";
import {
  Cog6ToothIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function WashingMachinePage() {
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
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");

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

        setWomenBookings(womenBookingsRes.data);
        setMenBookings(menBookingsRes.data);
        setWomenFacilities(womenFacilitiesRes.data || []);
        setMenFacilities(menFacilitiesRes.data || []);

        console.log("🏁 Successfully loaded washing machine data");
      } catch (error) {
        console.error("❌ Error fetching washing machine data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
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

  const handleMachineClick = (facility: WashingMachineFacility) => {
    console.log("Selected machine:", facility);
    // TODO: Open booking modal
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red mb-6 font-mono tracking-wider">
            LAUNDRY CONTROL MATRIX
          </h1>
          <p className="text-lg text-red font-mono tracking-wide opacity-75">
            [ INTERACTIVE FACILITY MANAGEMENT SYSTEM ]
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-black border border-red p-2 flex">
            <button
              onClick={() => setActiveTab("women")}
              className={`px-8 py-3 font-mono font-bold tracking-widest text-sm transition-all duration-300 ${
                activeTab === "women"
                  ? "bg-red/20 text-red border border-red"
                  : "text-red/60 hover:text-red hover:bg-red/10"
              }`}
            >
              [ WOMEN'S SECTOR ]
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`px-8 py-3 font-mono font-bold tracking-widest text-sm transition-all duration-300 ${
                activeTab === "men"
                  ? "bg-red/20 text-red border border-red"
                  : "text-red/60 hover:text-red hover:bg-red/10"
              }`}
            >
              [ MEN'S SECTOR ]
            </button>
          </div>
        </div>

        {/* Machine Layout */}
        <WashingMachineLayout
          facilities={activeTab === "women" ? womenFacilities : menFacilities}
          bookings={activeTab === "women" ? womenBookings : menBookings}
          type={activeTab}
          onMachineClick={handleMachineClick}
        />

        {/* Summary Stats */}
        <div className="bg-black border border-red p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red/5 via-transparent to-red/3"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-mono font-bold text-red mb-6 text-center">
              [ SYSTEM STATUS OVERVIEW ]
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-red/10 border border-red opacity-75">
                <div className="text-3xl font-mono font-bold text-red mb-2">
                  {womenFacilities.length}
                </div>
                <div className="text-xs font-mono tracking-widest text-red">
                  WOMEN'S UNITS
                </div>
              </div>
              <div className="text-center p-4 bg-red/10 border border-red opacity-75">
                <div className="text-3xl font-mono font-bold text-red mb-2">
                  {menFacilities.length}
                </div>
                <div className="text-xs font-mono tracking-widest text-red">
                  MEN'S UNITS
                </div>
              </div>
              <div className="text-center p-4 bg-red/10 border border-red">
                <div className="text-3xl font-mono font-bold text-red mb-2">
                  {womenBookings.filter(
                    (b) => new Date(b.waktuBerakhir) > new Date()
                  ).length +
                    menBookings.filter(
                      (b) => new Date(b.waktuBerakhir) > new Date()
                    ).length}
                </div>
                <div className="text-xs font-mono tracking-widest text-red">
                  ACTIVE SESSIONS
                </div>
              </div>
              <div className="text-center p-4 bg-red/10 border border-red opacity-50">
                <div className="text-3xl font-mono font-bold text-red mb-2">
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
                <div className="text-xs font-mono tracking-widest text-red">
                  AVAILABLE NOW
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need to do laundry?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Click on any machine in the layout above to see its status and
              book a slot. Our interactive system prevents conflicts and helps
              you plan your laundry schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/users"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Manage Users
              </Link>
              <button
                onClick={() => {
                  // Scroll to the layout
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="bg-purple-600 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Select Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
