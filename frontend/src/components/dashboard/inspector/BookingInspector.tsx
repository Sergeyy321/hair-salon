import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingApi } from '../../../lib/api';
import { Clock, Mail, Phone, Check, X, CalendarClock, Scissors, UserCheck, Calendar } from 'lucide-react';

interface BookingInspectorProps {
  booking: BookingApi | null;
  onUpdateStatus: (bookingId: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED') => void;
  onOpenReschedule: (booking: BookingApi) => void;
  onRequestCancel?: (booking: BookingApi) => void;
}

export const BookingInspector: React.FC<BookingInspectorProps> = ({
  booking,
  onUpdateStatus,
  onOpenReschedule,
  onRequestCancel,
}) => {
  const { t } = useTranslation();

  if (!booking) {
    return (
      <aside className="w-96 h-full bg-paper-200 border-l border-line flex flex-col justify-between p-6 select-none shrink-0">
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 border border-line-dark rounded-sm flex items-center justify-center text-charcoal-500 mb-4 bg-paper-100">
            <CalendarClock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="font-serif text-body italic text-charcoal-500 max-w-[240px]">
            {t('timeline.empty_inspector')}
          </p>
        </div>

        <div className="pt-4 border-t border-line text-micro text-charcoal-500 font-mono flex justify-between">
          <span>{t('timeline.duty')}</span>
          <span>LUME ATELIER</span>
        </div>
      </aside>
    );
  }

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
        return 'bg-status-confirmed-bg text-status-confirmed-text border-status-confirmed-border';
      case 'PENDING':
        return 'bg-status-pending-bg text-status-pending-text border-status-pending-border';
      case 'CANCELLED':
        return 'bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border';
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

  const clientName = booking.client.name ?? booking.client.email.split('@')[0] ?? 'Client';
  const clientPhone = booking.client.phone ?? '+48 512 890 234';
  const clientAvatar =
    booking.client.avatarUrl ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

  const barberAvatar =
    booking.barber.avatarUrl ??
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <aside className="w-96 h-full bg-paper-200 border-l border-line flex flex-col justify-between p-6 overflow-y-auto scrollbar-none select-none shrink-0">
      <div className="space-y-6">
        <div className="border-b border-line pb-4 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
              {t('inspector.details_title')}
            </span>
            <span className="text-micro font-mono text-charcoal-500 mt-0.5 block">
              #{booking.id.slice(0, 8)}
            </span>
          </div>

          <span
            className={`text-label font-medium font-mono border px-3 py-1 rounded-sm uppercase tracking-wider ${getStatusStyles()}`}
          >
            {getStatusLabel()}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-micro uppercase font-mono tracking-wider text-charcoal-500 block">
            {t('inspector.client')}
          </span>
          <div className="p-4 bg-paper-100 border border-line rounded-sm flex items-center gap-3.5">
            <img
              src={clientAvatar}
              alt={clientName}
              className="w-12 h-12 rounded-full object-cover border border-line-dark shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-body text-charcoal-900 block truncate">
                {clientName}
              </span>
              <div className="flex items-center gap-1.5 text-charcoal-500 font-mono text-label mt-0.5 truncate">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{clientPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-charcoal-500 font-mono text-micro mt-0.5 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{booking.client.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-micro uppercase font-mono tracking-wider text-charcoal-500 block">
            {t('inspector.service')}
          </span>
          <div className="p-4 bg-paper-100 border border-line rounded-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-headline font-semibold text-charcoal-900 leading-snug">
                  {booking.service.name}
                </h3>
                <span className="text-micro font-mono text-charcoal-500 block mt-0.5">
                  Lume Ritual
                </span>
              </div>
              <span className="font-serif text-headline font-bold text-charcoal-900 shrink-0">
                {booking.service.price} zł
              </span>
            </div>

            <div className="pt-2.5 border-t border-line flex items-center justify-between text-micro font-mono text-charcoal-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{booking.service.durationMin} {t('booking.duration')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-terracotta" />
                <span>Specialist Care</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-micro uppercase font-mono tracking-wider text-charcoal-500 block">
            {t('inspector.master')}
          </span>
          <div className="p-3 bg-paper-100 border border-line rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={barberAvatar}
                alt={booking.barber.name ?? 'Barber'}
                className="w-8 h-8 rounded-full object-cover border border-line-dark shrink-0"
              />
              <div>
                <span className="font-semibold text-body text-charcoal-900 block leading-tight">
                  {booking.barber.name ?? 'Specialist'}
                </span>
                <span className="text-micro font-mono text-charcoal-500 block">
                  {booking.barber.specialization ?? 'Senior Stylist'}
                </span>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-charcoal-500" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-micro uppercase font-mono tracking-wider text-charcoal-500 block">
            {t('inspector.time_slot')}
          </span>
          <div className="p-3 bg-paper-100 border border-line rounded-sm flex items-center justify-between font-mono text-body">
            <div className="flex items-center gap-2 text-charcoal-900 font-medium">
              <Clock className="w-4 h-4 text-terracotta" />
              <span>{timeLabel}</span>
            </div>
            <span className="text-label text-charcoal-500">
              {booking.service.durationMin}m
            </span>
          </div>
        </div>

        {booking.notes && (
          <div className="space-y-1.5">
            <span className="text-micro uppercase font-mono tracking-wider text-charcoal-500 block">
              {t('inspector.notes')}
            </span>
            <div className="p-3.5 bg-paper-100 border border-line rounded-sm text-label text-charcoal-700 italic">
              «{booking.notes}»
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-line space-y-2">
          {booking.status !== 'CONFIRMED' && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
              className="w-full py-2.5 bg-charcoal-900 text-paper-50 text-label font-medium rounded-sm hover:bg-charcoal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t('inspector.complete_pay')}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenReschedule(booking)}
              className="py-2 border border-line bg-paper-100 text-charcoal-700 text-label hover:bg-paper-300 rounded-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{t('inspector.reschedule')}</span>
            </button>
            <button
              onClick={() => (onRequestCancel ? onRequestCancel(booking) : onUpdateStatus(booking.id, 'CANCELLED'))}
              className="py-2 border border-status-cancelled-border bg-status-cancelled-bg text-status-cancelled-text text-label hover:bg-red-100 rounded-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('inspector.cancel')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-line text-micro text-charcoal-500 font-mono flex justify-between">
        <span>{t('timeline.duty')}</span>
        <span>LUMÉ SYSTEM</span>
      </div>
    </aside>
  );
};
