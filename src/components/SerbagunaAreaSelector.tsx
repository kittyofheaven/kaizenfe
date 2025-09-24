"use client";

import { useState, useEffect } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface SerbagunaArea {
  id: string;
  namaArea: string;
}

interface SerbagunaAreaSelectorProps {
  selectedAreaId: string | null;
  onAreaSelect: (areaId: string | null) => void;
}

export default function SerbagunaAreaSelector({
  selectedAreaId,
  onAreaSelect,
}: SerbagunaAreaSelectorProps) {
  const [areas, setAreas] = useState<SerbagunaArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available areas from API
  const fetchAreas = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found, using default areas");
        // Use default areas if no token
        const defaultAreas = generateDefaultAreas();
        setAreas(defaultAreas);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/v1/serbaguna/areas", {
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
        setAreas(result.data);
      } else {
        // Fallback: use default areas
        const defaultAreas = generateDefaultAreas();
        setAreas(defaultAreas);
      }
    } catch (error) {
      console.error("Error fetching serbaguna areas:", error);
      setError("Failed to load areas");
      // Fallback: use default areas
      const defaultAreas = generateDefaultAreas();
      setAreas(defaultAreas);
    } finally {
      setLoading(false);
    }
  };

  // Generate default areas (fallback)
  const generateDefaultAreas = (): SerbagunaArea[] => {
    return [
      { id: "1", namaArea: "Area Meeting A" },
      { id: "2", namaArea: "Area Meeting B" },
      { id: "3", namaArea: "Area Meeting C" },
      { id: "4", namaArea: "Area Meeting D" },
    ];
  };

  // Fetch areas on component mount
  useEffect(() => {
    fetchAreas();
  }, []);

  const handleAreaClick = (area: SerbagunaArea) => {
    if (selectedAreaId === area.id) {
      onAreaSelect(null); // Deselect if already selected
    } else {
      onAreaSelect(area.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Area
        </h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Loading areas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <MapPinIcon className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Area
        </h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            ⚠️ {error}. Showing default areas.
          </p>
        </div>
      )}

      {!localStorage.getItem("token") && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ You are not logged in. Showing default areas.
            <a href="/login" className="underline ml-1">
              Login
            </a>{" "}
            to see real-time areas.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.id;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => handleAreaClick(area)}
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
                <MapPinIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{area.namaArea}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Serbaguna Area
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Area Info */}
      {selectedAreaId && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Selected Area
          </h4>
          <p className="text-blue-700 dark:text-blue-300">
            {areas.find((area) => area.id === selectedAreaId)?.namaArea}
          </p>
        </div>
      )}
    </div>
  );
}

