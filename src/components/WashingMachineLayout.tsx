"use client";

import { useState } from "react";
import { WashingMachineFacility, WashingMachineBooking } from "@/types/api";
import {
  Cog6ToothIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
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
        return "bg-black/80 border-red text-red opacity-50 hover:bg-red/10";
      case "occupied":
        return "bg-black/80 border-red text-red hover:bg-red/10";
      case "maintenance":
        return "bg-black/80 border-red text-red opacity-75 hover:bg-red/10";
      default:
        return "bg-black/80 border-red text-red hover:bg-red/10";
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
    <div className="space-y-8 cyber-grid p-6 rounded-lg">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-red mb-4">
          {type === "women" ? "WOMEN'S" : "MEN'S"} LAUNDRY MATRIX
        </h3>
        <p className="text-red text-sm font-mono tracking-wider">
          [ SELECT UNIT TO ACCESS INTERFACE ]
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-8 text-sm font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red border border-red rounded-sm opacity-50"></div>
          <span className="text-red opacity-50">AVAILABLE</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red border border-red rounded-sm"></div>
          <span className="text-red">OCCUPIED</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red border border-red rounded-sm opacity-75"></div>
          <span className="text-red opacity-75">MAINTENANCE</span>
        </div>
      </div>

      {/* Machine Layout Grid */}
      <div className="bg-black border border-red p-8 relative overflow-hidden">
        {/* Subtle background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red/5 to-transparent"></div>

        {/* Grid container */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {machineStatuses.map((machine, index) => (
              <div
                key={machine.id}
                className={`
                  relative aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${getMachineColor(machine.status)}
                  ${
                    selectedMachine === machine.id
                      ? "ring-2 ring-red"
                      : ""
                  }
                  red-border group
                `}
                onClick={() => handleMachineClick(machine)}
              >
                {/* Machine Interface */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  {/* Main Display */}
                  <div className="relative mb-2">
                    <div className="w-12 h-12 border-2 border-current rounded-sm flex items-center justify-center">
                      <span className="text-lg font-mono font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Status LED */}
                    <div className="absolute -top-1 -right-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          machine.status === "available"
                            ? "bg-red opacity-50"
                            : machine.status === "occupied"
                            ? "bg-red animate-pulse"
                            : "bg-red opacity-75"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Status Display */}
                  <div className="text-center">
                    <div className="text-[10px] font-mono tracking-widest uppercase opacity-80">
                      {machine.status}
                    </div>
                  </div>

                  {/* Subtle border effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-red"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red"></div>
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-red"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-red"></div>
                  </div>
                </div>

                {/* Simple indicator for active machines */}
                {machine.currentBooking && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-red animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Room Label */}
        <div className="text-center mt-8 p-4 bg-black border border-red">
          <h4 className="font-mono text-lg font-bold text-red">
            [ {type === "women" ? "WOMEN'S" : "MEN'S"} SECTOR ]
          </h4>
          <div className="mt-2 font-mono text-sm">
            <span className="text-red opacity-50">
              {machineStatuses.filter((m) => m.status === "available").length}
            </span>
            <span className="text-red mx-2">/</span>
            <span className="text-red">{machineStatuses.length}</span>
            <span className="text-red ml-2">UNITS ONLINE</span>
          </div>
        </div>
      </div>

      {/* Machine Details Panel */}
      {selectedMachine && (
        <div className="bg-black border border-red p-6 relative overflow-hidden subtle-gradient">
          <div className="relative z-10">
            {(() => {
              const machine = machineStatuses.find(
                (m) => m.id === selectedMachine
              );
              if (!machine) return null;

              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-mono font-bold text-red">
                      UNIT: {machine.name}
                    </h4>
                    <div
                      className={`px-4 py-2 border font-mono text-xs tracking-widest ${
                        machine.status === "available"
                          ? "bg-red/20 text-red border-red opacity-50"
                          : machine.status === "occupied"
                          ? "bg-red/20 text-red border-red"
                          : "bg-red/20 text-red border-red opacity-75"
                      }`}
                    >
                      [ {machine.status.toUpperCase()} ]
                    </div>
                  </div>

                  {machine.currentBooking && (
                    <div className="mb-6 p-4 bg-red/10 border border-red">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-red rounded-full animate-pulse mr-3"></div>
                        <span className="font-mono text-sm font-bold text-red tracking-wider">
                          [ ACTIVE SESSION ]
                        </span>
                      </div>
                      <div className="font-mono text-sm text-red space-y-1">
                        <p>
                          <span className="text-red opacity-75">USER:</span>{" "}
                          {machine.currentBooking.peminjam.namaLengkap}
                        </p>
                        <p>
                          <span className="text-red opacity-75">UNTIL:</span>{" "}
                          {formatTime(machine.currentBooking.waktuBerakhir)}
                        </p>
                      </div>
                    </div>
                  )}

                  {machine.nextBooking && (
                    <div className="mb-6 p-4 bg-red/10 border border-red opacity-75">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-red rounded-full animate-pulse mr-3"></div>
                        <span className="font-mono text-sm font-bold text-red tracking-wider">
                          [ QUEUED SESSION ]
                        </span>
                      </div>
                      <div className="font-mono text-sm text-red space-y-1">
                        <p>
                          <span className="text-red opacity-75">USER:</span>{" "}
                          {machine.nextBooking.peminjam.namaLengkap}
                        </p>
                        <p>
                          <span className="text-red opacity-75">TIME:</span>{" "}
                          {formatTime(machine.nextBooking.waktuMulai)} -{" "}
                          {formatTime(machine.nextBooking.waktuBerakhir)}
                        </p>
                      </div>
                    </div>
                  )}

                  {machine.status === "available" && !machine.nextBooking && (
                    <div className="p-4 bg-red/10 border border-red opacity-50">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-red rounded-full mr-3"></div>
                        <span className="font-mono text-sm font-bold text-red tracking-wider">
                          [ READY FOR BOOKING ]
                        </span>
                      </div>
                      <button className="w-full mt-3 bg-red/20 border border-red text-red py-3 px-6 font-mono font-bold tracking-wider hover:bg-red/30 transition-all duration-300">
                        [ INITIALIZE SESSION ]
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
