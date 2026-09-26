import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingApi } from '../../../lib/api';
import { calculateTimelineGeometry } from '../../../features/timeline/useTimelinePosition';

interface BookingCardProps {
  booking: BookingApi;
  isSelected: boolean;
  onSelect: (booking: BookingApi) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  isSelected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { top, height } = calculateTimelineGeometry(booking.startTime, booking.endTime);

  const formatHourMin = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) {
        return isoStr;
      }
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return isoStr;
    }
  };

  const timeLabel = `${formatHourMin(booking.startTime)} — ${formatHourMin(booking.endTime)}`;

  const getStatusStyles = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return 'bg-status-confirmed-bg border-status-confirmed-border text-status-confirmed-text';
      case 'PENDING':
        return 'bg-status-pending-bg border-status-pending-border text-status-pending-text';
      case 'CANCELLED':
        return 'bg-status-cancelled-bg border-status-cancelled-border text-status-cancelled-text opacity-70';
    }
  };

  const getStatusDot = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return 'bg-status-confirmed-text';
      case 'PENDING':
        return 'bg-status-pending-text';
      case 'CANCELLED':
        return 'bg-status-cancelled-text';
    }
  };

  const getStatusLabel = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return t('status.confirmed');
      case 'PENDING':
        return t('status.pending');
      case 'CANCELLED':
        return t('status.cancelled');
    }
  };

  const formattedPrice =
    typeof booking.service.price === 'number'
      ? `${booking.service.price} zł`
      : `${booking.service.price} zł`;

  const clientDisplayName = booking.client.name ?? booking.client.email.split('@')[0] ?? 'Client';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(booking);
      }}
      style={{ top, height }}
      className={`absolute left-1 right-1 border p-2.5 flex flex-col justify-between cursor-pointer rounded-sm transition-all overflow-hidden select-none ${getStatusStyles()} ${
        isSelected
          ? 'ring-2 ring-charcoal-900 border-charcoal-900 z-20 shadow-sm'
          : 'hover:border-charcoal-700 z-10'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 pointer-events-none">
          <span className="text-micro font-mono font-medium tracking-tight">
            {timeLabel}
          </span>
          <span className="text-micro font-mono font-semibold shrink-0">
            {formattedPrice}
          </span>
        </div>
        <div className="font-semibold text-body text-charcoal-900 truncate mt-1 pointer-events-none">
          {clientDisplayName}
        </div>
        <div className="text-micro text-charcoal-500 truncate mt-0.5 pointer-events-none">
          {booking.service.name}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1 pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot()}`} />
        <span className="text-micro font-mono uppercase tracking-wider truncate">
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
};
