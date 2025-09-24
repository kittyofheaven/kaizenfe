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
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">KAIZEN</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="nomorWa"
                className="block text-sm font-medium text-foreground mb-2"
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
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
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <span className="text-primary">Contact your administrator</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
