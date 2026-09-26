import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BarberApi, BookingApi } from '../../../lib/api';
import { StaffColumn } from './StaffColumn';
import { getCurrentTimeInfo } from '../../../features/timeline/useTimelinePosition';

interface TimelineGridProps {
  barbers: BarberApi[];
  bookings: BookingApi[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: BookingApi) => void;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  barbers,
  bookings,
  selectedBookingId,
  onSelectBooking,
}) => {
  const { t } = useTranslation();
  const timeInfo = getCurrentTimeInfo();

  return (
    <main className="h-full overflow-y-auto overflow-x-auto bg-paper-100 relative scrollbar-none">
      <div
        className="h-full flex flex-col"
        style={{ minWidth: `${70 + barbers.length * 260}px` }}
      >
        <div
          className="sticky top-0 z-20 grid bg-paper-200 border-b border-line text-charcoal-900 select-none"
          style={{ gridTemplateColumns: `70px repeat(${barbers.length}, 1fr)` }}
        >
          <div className="py-3 px-3 border-r border-line text-micro font-mono text-charcoal-500 flex items-center justify-center">
            {t('timeline.hours')}
          </div>

          {barbers.map((barber, idx) => (
            <div
              key={barber.id}
              className={`py-3 px-4 flex items-center gap-3 ${
                idx < barbers.length - 1 ? 'border-r border-line' : ''
              }`}
            >
              <img
                src={
                  barber.avatarUrl ??
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={barber.name}
                className="w-10 h-10 rounded-full object-cover border border-line-dark shrink-0"
              />
              <div className="min-w-0">
                <span className="text-body font-semibold text-charcoal-900 truncate block">
                  {barber.name}
                </span>
                <span className="text-micro text-charcoal-500 font-mono truncate block">
                  {barber.specialization ?? 'Specialist'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="relative grid flex-1 min-h-[720px]"
          style={{ gridTemplateColumns: `70px repeat(${barbers.length}, 1fr)` }}
        >
          <div className="border-r border-line bg-paper-100 font-mono text-micro text-charcoal-500 select-none">
            {Array.from({ length: 11 }).map((_, i) => {
              const hour = 8 + i;
              return (
                <div key={hour} className="h-[72px] border-b border-line-light px-2.5 pt-1.5">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              );
            })}
          </div>

          {barbers.map((barber) => (
            <StaffColumn
              key={barber.id}
              barber={barber}
              bookings={bookings}
              selectedBookingId={selectedBookingId}
              onSelectBooking={onSelectBooking}
            />
          ))}

          {timeInfo !== null && (
            <div
              style={{ top: `${timeInfo.offsetPx}px` }}
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center -translate-y-1/2"
            >
              <div className="w-[70px] flex justify-end pr-1.5">
                <span className="bg-terracotta text-paper-50 text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-sm tracking-tight shadow-none">
                  {timeInfo.timeString}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-terracotta -mr-1 z-10" />
              <div className="flex-1 h-[1.5px] bg-terracotta" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
