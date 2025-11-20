"use client";

import { useState, useEffect, useCallback } from "react";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

interface KitchenFacility {
  id: string;
  fasilitas: string;
}

interface KitchenFacilitySelectorProps {
  selectedFacilityId: string | null;
  onFacilitySelect: (facilityId: string | null) => void;
}

export default function KitchenFacilitySelector({
  selectedFacilityId,
  onFacilitySelect,
}: KitchenFacilitySelectorProps) {
  const [facilities, setFacilities] = useState<KitchenFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available facilities from API
  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found, using default kitchen facilities");
        // Use default facilities if no token
        const defaultFacilities = generateDefaultFacilities();
        setFacilities(defaultFacilities);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/v1/dapur/facilities", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setFacilities(result.data);
      } else {
        // Fallback: use default facilities
        const defaultFacilities = generateDefaultFacilities();
        setFacilities(defaultFacilities);
      }
    } catch (error) {
      console.error("Error fetching kitchen facilities:", error);
      setError("Failed to load facilities");
      // Fallback: use default facilities
      const defaultFacilities = generateDefaultFacilities();
      setFacilities(defaultFacilities);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate default facilities (fallback)
  const generateDefaultFacilities = (): KitchenFacility[] => {
    return [
      { id: "1", fasilitas: "Kompor Gas" },
      { id: "2", fasilitas: "Microwave" },
      { id: "3", fasilitas: "Oven" },
      { id: "4", fasilitas: "Kulkas" },
      { id: "5", fasilitas: "Blender" },
      { id: "6", fasilitas: "Rice Cooker" },
    ];
  };

  // Fetch facilities on component mount
  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleFacilityClick = (facility: KitchenFacility) => {
    if (selectedFacilityId === facility.id) {
      onFacilitySelect(null); // Deselect if already selected
    } else {
      onFacilitySelect(facility.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Kitchen Facility
        </h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Loading facilities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <WrenchScrewdriverIcon className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Kitchen Facility
        </h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            ⚠️ {error}. Showing default facilities.
          </p>
        </div>
      )}

      {!localStorage.getItem("token") && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ You are not logged in. Showing default facilities.
            <a href="/login" className="underline ml-1">
              Login
            </a>{" "}
            to see real-time facilities.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {facilities.map((facility) => {
          const isSelected = selectedFacilityId === facility.id;

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => handleFacilityClick(facility)}
              className={`
                p-4 rounded-lg border-2 text-sm font-medium transition-all text-left
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:text-gray-200"
                }
              `}
            >
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{facility.fasilitas}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Kitchen Facility
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Facility Info */}
      {selectedFacilityId && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Selected Facility
          </h4>
          <p className="text-blue-700 dark:text-blue-300">
            {
              facilities.find((facility) => facility.id === selectedFacilityId)
                ?.fasilitas
            }
          </p>
        </div>
      )}
    </div>
  );
}
