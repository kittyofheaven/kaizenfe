"use client";

import { useState } from "react";
import { WashingMachineFacility, WashingMachineBooking } from "@/types/api";
import { ClockIcon, UserIcon } from "@heroicons/react/24/solid";

interface WashingMachineCardProps {
  facility: WashingMachineFacility;
  bookings: WashingMachineBooking[];
  onClick?: () => void;
  onBookNow?: () => void;
}

export default function WashingMachineCard({
  facility,
  bookings,
  onClick,
  onBookNow,
}: WashingMachineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentBooking = bookings.find(
    (booking) =>
      booking.idFasilitas === facility.id &&
      new Date(booking.waktuMulai) <= new Date() &&
      new Date(booking.waktuBerakhir) > new Date()
  );

  const nextBooking = bookings.find(
    (booking) =>
      booking.idFasilitas === facility.id &&
      new Date(booking.waktuMulai) > new Date()
  );

  const getStatus = () => {
    if (currentBooking) return "occupied";
    if (facility.status === "maintenance") return "maintenance";
    return "available";
  };

  const status = getStatus();

  const getStatusStyle = () => {
    switch (status) {
      case "available":
        return "border-success text-success";
      case "occupied":
        return "border-primary text-primary";
      case "maintenance":
        return "border-warning text-warning";
      default:
        return "border-muted-foreground text-muted-foreground";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="card relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="aspect-video bg-secondary flex items-center justify-center relative overflow-hidden rounded-t-[10px]">
        {/* Machine Number */}
        <div className="text-4xl font-extrabold text-foreground/10">
          {facility.nama.split(" ").pop()}
        </div>

        {/* Status Indicator */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium border ${getStatusStyle()}`}
        >
          {status.toUpperCase()}
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-4 space-y-2">
        <h3 className="text-foreground font-semibold text-base">
          {facility.nama}
        </h3>

        {currentBooking && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UserIcon className="w-4 h-4 mr-2" />
            <span>In use by {currentBooking.peminjam.namaLengkap}</span>
          </div>
        )}

        {nextBooking && (
          <div className="flex items-center text-sm text-muted-foreground">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>Next: {formatTime(nextBooking.waktuMulai)}</span>
          </div>
        )}

        {status === "available" && !nextBooking && (
          <div className="text-sm text-success">Available now</div>
        )}

        {/* Action Button */}
        {isHovered && (
          <div className="pt-2">
            {status === "available" ? (
              <button
                className="btn-primary w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow?.();
                }}
              >
                Book Now
              </button>
            ) : (
              <button
                className="btn-secondary w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View Details
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
