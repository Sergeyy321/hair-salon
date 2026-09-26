import React from 'react';
import type { BarberApi, BookingApi } from '../../../lib/api';
import { BookingCard } from './BookingCard';

interface StaffColumnProps {
  barber: BarberApi;
  bookings: BookingApi[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: BookingApi) => void;
}

export const StaffColumn: React.FC<StaffColumnProps> = ({
  barber,
  bookings,
  selectedBookingId,
  onSelectBooking,
}) => {
  const staffBookings = bookings.filter((b) => b.barberId === barber.id);

  return (
    <div className="relative border-r border-line bg-paper-50/40 min-h-[720px]">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="h-[72px] border-b border-line-light pointer-events-none" />
      ))}

      {staffBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          isSelected={selectedBookingId === booking.id}
          onSelect={onSelectBooking}
        />
      ))}
    </div>
  );
};
