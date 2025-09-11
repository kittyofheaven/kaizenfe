"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  FireIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Users", href: "/users", icon: UsersIcon },
  { name: "Communal Room", href: "/communal", icon: BuildingOfficeIcon },
  { name: "Serbaguna Area", href: "/serbaguna", icon: CubeIcon },
  { name: "Kitchen", href: "/kitchen", icon: FireIcon },
  { name: "Washing Machine", href: "/washing-machine", icon: Cog6ToothIcon },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-black border-b border-red">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red border border-red flex items-center justify-center">
                  <span className="text-black font-mono font-bold text-xl">
                    K
                  </span>
                </div>
                <span className="text-2xl font-mono font-bold text-red tracking-wider">
                  KAIZEN
                </span>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 border-b-2 text-xs font-mono font-bold tracking-wider transition-all duration-300 ${
                      isActive
                        ? "border-red text-red bg-red/10"
                        : "border-transparent text-red/70 hover:text-red hover:border-red/50 hover:bg-red/5"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name.toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 border border-red text-red hover:text-red-light hover:border-red-light hover:bg-red/10 focus:outline-none focus:ring-2 focus:ring-red transition-all duration-300"
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
          <div className="pt-2 pb-3 space-y-1 bg-black border-t border-red">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-4 pr-4 py-3 text-sm font-mono font-bold tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-red/10 border-r-4 border-red text-red"
                      : "text-red/70 hover:text-red hover:bg-red/5 hover:border-r-2 hover:border-red/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name.toUpperCase()}
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
