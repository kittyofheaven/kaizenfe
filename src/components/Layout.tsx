"use client";

import Navigation from "./Navigation";
import ProtectedRoute from "./ProtectedRoute";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(255,255,255,0.025),transparent_30%)]" />
        <Navigation />
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
