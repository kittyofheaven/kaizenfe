/**
 * Authentication utilities for handling token expiry and redirects
 */

/**
 * Clear authentication data and redirect to login
 * This function can be called from anywhere in the app
 */
export const handleTokenExpiry = (message?: string) => {
  // Clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Show optional message
    if (message) {
      console.warn("🔐 Auth Error:", message);
    }

    // Redirect to login
    window.location.href = "/login";
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return !!(token && user);
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Get stored user data
 */
export const getStoredUser = (): any | null => {
  if (typeof window === "undefined") return null;

  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    return null;
  }
};
