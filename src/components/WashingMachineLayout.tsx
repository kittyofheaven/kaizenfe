"use client";

import { useState } from "react";
import { WashingMachineFacility, WashingMachineBooking } from "@/types/api";
import { 
  Cog6ToothIcon, 
  ClockIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon 
} from "@heroicons/react/24/outline";

interface WashingMachineLayoutProps {
  facilities: WashingMachineFacility[];
  bookings: WashingMachineBooking[];
  type: "women" | "men";
  onMachineClick?: (facility: WashingMachineFacility) => void;
}

interface MachineStatus {
  id: string;
  name: string;
  status: "available" | "occupied" | "maintenance";
  currentBooking?: WashingMachineBooking;
  nextBooking?: WashingMachineBooking;
}

export default function WashingMachineLayout({
  facilities,
  bookings,
  type,
  onMachineClick,
}: WashingMachineLayoutProps) {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Process machine status
  const getMachineStatus = (): MachineStatus[] => {
    return facilities.map((facility) => {
      const now = new Date();
      const currentBooking = bookings.find(
        (booking) =>
          booking.idFasilitas === facility.id &&
          new Date(booking.waktuMulai) <= now &&
          new Date(booking.waktuBerakhir) > now
      );

      const nextBooking = bookings
        .filter(
          (booking) =>
            booking.idFasilitas === facility.id &&
            new Date(booking.waktuMulai) > now
        )
        .sort(
          (a, b) =>
            new Date(a.waktuMulai).getTime() - new Date(b.waktuMulai).getTime()
        )[0];

      return {
        id: facility.id,
        name: facility.nama,
        status: currentBooking ? "occupied" : "available",
        currentBooking,
        nextBooking,
      };
    });
  };

  const machineStatuses = getMachineStatus();

  const getMachineColor = (status: MachineStatus["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700";
      case "occupied":
        return "bg-red-100 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:border-red-700";
      case "maintenance":
        return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
      default:
        return "bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600";
    }
  };

  const getStatusIcon = (status: MachineStatus["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "occupied":
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case "maintenance":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <Cog6ToothIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMachineClick = (machine: MachineStatus) => {
    setSelectedMachine(selectedMachine === machine.id ? null : machine.id);
    if (onMachineClick) {
      const facility = facilities.find((f) => f.id === machine.id);
      if (facility) onMachineClick(facility);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {type === "women" ? "Women's" : "Men's"} Washing Machine Layout
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click on a machine to see details and book
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Occupied</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
        </div>
      </div>

      {/* Machine Layout Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {machineStatuses.map((machine, index) => (
            <div
              key={machine.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105
                ${getMachineColor(machine.status)}
                ${selectedMachine === machine.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}
              `}
              onClick={() => handleMachineClick(machine)}
            >
              {/* Machine Icon */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Cog6ToothIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon(machine.status)}
                  </div>
                </div>
                
                {/* Machine Number */}
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    #{index + 1}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {machine.status}
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {machine.currentBooking && (
                <div className="absolute top-1 left-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Room Label */}
        <div className="text-center mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {type === "women" ? "Women's" : "Men's"} Laundry Room
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {machineStatuses.filter(m => m.status === "available").length} of {machineStatuses.length} machines available
          </p>
        </div>
      </div>

      {/* Machine Details Panel */}
      {selectedMachine && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          {(() => {
            const machine = machineStatuses.find(m => m.id === selectedMachine);
            if (!machine) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {machine.name}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    machine.status === "available" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : machine.status === "occupied"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}>
                    {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </span>
                </div>

                {machine.currentBooking && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-400">
                        Currently in use
                      </span>
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p><strong>User:</strong> {machine.currentBooking.peminjam.namaLengkap}</p>
                      <p><strong>Until:</strong> {formatTime(machine.currentBooking.waktuBerakhir)}</p>
                    </div>
                  </div>
                )}

                {machine.nextBooking && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                        Next booking
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p><strong>User:</strong> {machine.nextBooking.peminjam.namaLengkap}</p>
                      <p><strong>Time:</strong> {formatTime(machine.nextBooking.waktuMulai)} - {formatTime(machine.nextBooking.waktuBerakhir)}</p>
                    </div>
                  </div>
                )}

                {machine.status === "available" && !machine.nextBooking && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">
                        Available now
                      </span>
                    </div>
                    <button className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Book This Machine
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
