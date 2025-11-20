"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { LoginRequest } from "@/types/api";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    nomorWa: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting login...", { nomorWa: formData.nomorWa });

      const response = await apiClient.login(formData);

      if (response.success && response.data) {
        console.log("✅ Login successful:", response.data);

        // Store auth data in context
        login(response.data.token, response.data.user);

        // Redirect to dashboard
        router.push("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="card relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
              RTB CONNECT
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground">
                Sign in to your account
              </h1>
              <p className="text-muted-foreground">
                RTB Connect mempermudah pengelolaan booking fasilitas. Gunakan
                akun yang sudah didaftarkan admin.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                <span className="pill text-xs text-foreground">Support</span>
                Hubungi admin jika butuh akses baru.
              </div>
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <form onSubmit={handleSubmit} className="relative space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Login Portal
              </p>
              <p className="text-2xl font-semibold text-foreground">RTB CONNECT</p>
            </div>

            {error ? (
              <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="nomorWa"
                className="block text-sm font-medium text-foreground"
              >
                WhatsApp Number
              </label>
              <input
                id="nomorWa"
                name="nomorWa"
                type="text"
                placeholder="+6281234567890"
                value={formData.nomorWa}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-lg text-center transition duration-200 hover:-translate-y-0.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="pt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <span className="text-primary">Contact your administrator</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
