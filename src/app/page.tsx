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
    color: "bg-gradient-to-br from-primary to-primary/60",
  },
  {
    name: "CWS",
    description: "Book community work space",
    href: "/cws",
    icon: BuildingOffice2Icon,
    color: "bg-gradient-to-br from-accent to-primary/60",
  },
  {
    name: "Theater",
    description: "Reserve the theater for screenings or events",
    href: "/theater",
    icon: VideoCameraIcon,
    color: "bg-gradient-to-br from-primary to-primary/60",
  },
  {
    name: "Serbaguna Area",
    description: "Reserve multipurpose areas",
    href: "/serbaguna",
    icon: CubeIcon,
    color: "bg-gradient-to-br from-primary to-primary/60",
  },
  {
    name: "Kitchen",
    description: "Book kitchen facilities",
    href: "/kitchen",
    icon: FireIcon,
    color: "bg-gradient-to-br from-accent to-primary/60",
  },
  {
    name: "Washing Machine",
    description: "Reserve washing machines",
    href: "/washing-machine",
    icon: Cog6ToothIcon,
    color: "bg-gradient-to-br from-primary to-primary/60",
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

  const statItems = [
    {
      label: "Active Facilities",
      value: stats.activeFacilities,
      icon: BuildingOfficeIcon,
      barWidth: "w-4/5",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: BuildingOffice2Icon,
      barWidth: "w-3/4",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: ClockIcon,
      barWidth: "w-2/3",
    },
    {
      label: "Available Slots",
      value: stats.availableSlots,
      icon: Cog6ToothIcon,
      barWidth: "w-3/5",
    },
  ];

  return (
    <Layout>
      <div className="space-y-12">
        <section className="rounded-2xl border border-border/80 bg-surface/80 p-8 shadow-[0_18px_46px_rgba(0,0,0,0.28)]">
          <div className="grid items-start gap-10 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Ringkasan Dashboard
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-foreground">
                  Kelola fasilitas lebih tenang
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Pantau pemesanan ruang komunal, theater, ruang kerja, area
                  serbaguna, dapur, hingga mesin cuci dalam satu tampilan yang
                  rapi. Fokus pada hal penting tanpa tab sukaduka dan warna yang
                  ramai.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/communal"
                  className="inline-flex items-center justify-center rounded-lg bg-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground transition duration-150 hover:-translate-y-0.5 hover:bg-primary"
                >
                  Buat booking baru
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition duration-150 hover:-translate-y-0.5 hover:border-primary/50"
                >
                  Lihat jadwal saya
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {statItems.map(({ label, value, icon: Icon, barWidth }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 bg-surface/90 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.26)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-muted-foreground">
                        {label}
                      </p>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {loading ? "..." : value}
                    </p>
                  </div>
                  <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${barWidth} rounded-full bg-primary/70`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card p-6 lg:p-7 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  Facility Management
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pilih fasilitas
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facilityCards.map((facility) => (
                  <Link
                    key={facility.name}
                    href={facility.href}
                    className="group flex h-full flex-col justify-between gap-4 rounded-xl border border-border/70 bg-surface/90 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-background/80"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary">
                        <facility.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {facility.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {facility.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <span className="h-px w-8 bg-border transition-colors duration-200 group-hover:bg-primary/70" />
                      <span>Kelola</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-7 lg:p-8 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Quick actions
              </p>
              <h3 className="text-2xl font-semibold text-foreground">
                Mulai dari kebutuhan utama
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pilih pintasan di bawah untuk langsung menuju proses booking
                tanpa langkah tambahan. Lebih ringkas, tetap rapi.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/communal"
                  className="inline-flex items-center justify-center rounded-lg bg-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground transition duration-150 hover:-translate-y-0.5 hover:bg-primary"
                >
                  Book Communal Room
                </Link>
                <Link
                  href="/cws"
                  className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition duration-150 hover:-translate-y-0.5 hover:border-primary/50"
                >
                  Book CWS
                </Link>
                <Link
                  href="/washing-machine"
                  className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition duration-150 hover:-translate-y-0.5 hover:border-primary/50 sm:col-span-2"
                >
                  Book Washing Machine
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px w-10 bg-border" />
                <span>Butuh orientasi? Mulai dari daftar fasilitas di kiri.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
