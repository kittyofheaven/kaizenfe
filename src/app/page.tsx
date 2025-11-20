"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { apiClient } from "@/lib/api";
import {
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  CubeIcon,
  FireIcon,
  Cog6ToothIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  availableSlots: number;
  activeFacilities: number;
}

const facilityCards = [
  {
    name: "Communal Room",
    description: "Book communal meeting rooms",
    href: "/communal",
    icon: BuildingOfficeIcon,
    color: "bg-primary",
  },
  {
    name: "CWS",
    description: "Book community work space",
    href: "/cws",
    icon: BuildingOffice2Icon,
    color: "bg-accent",
  },
  {
    name: "Theater",
    description: "Reserve the theater for screenings or events",
    href: "/theater",
    icon: VideoCameraIcon,
    color: "bg-primary",
  },
  {
    name: "Serbaguna Area",
    description: "Reserve multipurpose areas",
    href: "/serbaguna",
    icon: CubeIcon,
    color: "bg-primary",
  },
  {
    name: "Kitchen",
    description: "Book kitchen facilities",
    href: "/kitchen",
    icon: FireIcon,
    color: "bg-accent",
  },
  {
    name: "Washing Machine",
    description: "Reserve washing machines",
    href: "/washing-machine",
    icon: Cog6ToothIcon,
    color: "bg-primary",
  },
];

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    todayBookings: 0,
    availableSlots: 0,
    activeFacilities: 6, // Communal, CWS, Theater, Serbaguna, Kitchen, Washing Machine
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("🚀 Starting to fetch dashboard stats...");

        // Fetch basic stats
        console.log("🏢 Fetching communal bookings...");
        const [communalResponse, theaterResponse] = await Promise.all([
          apiClient.getCommunalBookings(),
          apiClient.getTheaterBookings(),
        ]);

        console.log("✅ Communal response:", communalResponse);
        console.log("🎭 Theater response:", theaterResponse);

        const communalTotal = communalResponse.pagination?.total || 0;
        const theaterTotal = theaterResponse.pagination?.total || 0;

        const newStats = {
          activeFacilities: 6,
          totalBookings: communalTotal + theaterTotal,
          todayBookings: 0, // Would need to filter by today
          availableSlots: 16, // Default slots per day
        };

        console.log("📈 Setting stats:", newStats);
        setStats(newStats);
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
        // Set some default values even on error
        setStats({
          totalBookings: 0,
          todayBookings: 0,
          availableSlots: 0,
          activeFacilities: 6,
        });
      } finally {
        console.log("🏁 Finished loading stats");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to RTB Connect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive facility booking system for communal rooms,
            theater sessions, collaborative workspaces, multipurpose areas,
            kitchen facilities, and washing machines.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Facilities
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : stats.activeFacilities}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : stats.totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Bookings
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : stats.todayBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Available Slots
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {loading ? "..." : stats.availableSlots}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Cards */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Facility Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilityCards.map((facility) => (
              <Link
                key={facility.name}
                href={facility.href}
                className="group card p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${facility.color}`}>
                    <facility.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {facility.name}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {facility.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to get started?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Choose a facility to manage or create new bookings. Our system
              ensures efficient scheduling and prevents double bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/communal"
                className="btn-primary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Book Communal Room
              </Link>
              <Link
                href="/cws"
                className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Book CWS
              </Link>
              <Link
                href="/washing-machine"
                className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Book Washing Machine
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
