"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon,
  BuildingOfficeIcon,
  CubeIcon,
  FireIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Communal Room", href: "/communal", icon: BuildingOfficeIcon },
  { name: "CWS", href: "/cws", icon: BuildingOffice2Icon },
  { name: "Serbaguna Area", href: "/serbaguna", icon: CubeIcon },
  { name: "Kitchen", href: "/kitchen", icon: FireIcon },
  { name: "Washing Machine", href: "/washing-machine", icon: Cog6ToothIcon },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call API logout (optional, as it's client-side only)
      // await apiClient.logout();
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      logout();
      router.push("/login");
    }
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="text-2xl font-extrabold text-primary tracking-tight">
                  KAIZEN
                </div>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {user.namaPanggilan}
                  </span>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user.namaLengkap}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.nomorWa}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-background border-t border-border">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-4 pr-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
