import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock, User, Scissors, AlertCircle, CheckCircle2, Ban } from 'lucide-react';
import { fetchMyBookings, cancelBooking, type BookingApi } from '../../lib/api';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSub: string;
  userName?: string | null;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  userSub,
  userName,
}) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [bookingToCancel, setBookingToCancel] = useState<BookingApi | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery<BookingApi[]>({
    queryKey: ['my-bookings', userSub],
    queryFn: () => fetchMyBookings(userSub),
    enabled: isOpen && Boolean(userSub),
    retry: 1,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-bookings', userSub] });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingToCancel(null);
    },
  });

  if (!isOpen) {
    return null;
  }

  const isPl = i18n.language.startsWith('pl');

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const datePart = new Intl.DateTimeFormat(isPl ? 'pl-PL' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
      const timePart = new Intl.DateTimeFormat(isPl ? 'pl-PL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
      return { datePart, timePart };
    } catch {
      return { datePart: isoString, timePart: '' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 select-none">
        <div className="w-full max-w-2xl bg-paper-100 border border-line rounded-sm flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper-50">
            <div>
              <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
                {t('my_bookings.eyebrow')}
              </span>
              <h2 className="font-serif text-headline font-bold text-charcoal-900 mt-0.5">
                {t('my_bookings.title')}
                {userName ? ` — ${userName}` : ''}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-charcoal-500 hover:bg-paper-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-charcoal-500">
                <div className="w-8 h-8 border border-charcoal-900 animate-spin flex items-center justify-center mb-3">
                  <span className="font-serif text-sm font-bold">L</span>
                </div>
                <span className="text-label font-mono">Lumé Atelier...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-status-cancelled-bg border border-status-cancelled-border rounded-sm text-status-cancelled-text text-label flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t('reschedule.error')}</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 border border-line bg-paper-50 flex items-center justify-center rounded-sm mb-4 text-charcoal-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-headline font-semibold text-charcoal-900 mb-1">
                  {t('my_bookings.empty_title')}
                </h3>
                <p className="text-body text-charcoal-500 max-w-sm mb-6">
                  {t('my_bookings.empty_desc')}
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors"
                >
                  {t('my_bookings.book_now')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const { datePart, timePart } = formatDateTime(booking.startTime);
                  const isCancelled = booking.status === 'CANCELLED';
                  const isConfirmed = booking.status === 'CONFIRMED';

                  return (
                    <div
                      key={booking.id}
                      className={`p-4 border rounded-sm transition-all ${
                        isCancelled
                          ? 'border-line/60 bg-paper-50/50 opacity-60'
                          : 'border-line bg-paper-50 hover:border-charcoal-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-terracotta shrink-0" />
                          <span className="font-serif font-bold text-headline text-charcoal-900">
                            {booking.service.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-charcoal-900">
                            {booking.service.price} zł
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-micro font-mono uppercase tracking-wider flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-status-confirmed-bg text-status-confirmed-text border border-status-confirmed-border'
                                : isCancelled
                                ? 'bg-status-cancelled-bg text-status-cancelled-text border border-status-cancelled-border'
                                : 'bg-status-pending-bg text-status-pending-text border border-status-pending-border'
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isCancelled ? (
                              <Ban className="w-3 h-3" />
                            ) : null}
                            <span>{t(`status.${booking.status.toLowerCase()}`)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-label font-mono">
                        <div className="flex items-center gap-2 text-charcoal-700">
                          <Calendar className="w-4 h-4 text-charcoal-400 shrink-0" />
                          <span>{datePart}</span>
                          <Clock className="w-3.5 h-3.5 text-charcoal-400 ml-1 shrink-0" />
                          <span>{timePart}</span>
                        </div>
                        <div className="flex items-center gap-2 text-charcoal-700">
                          <User className="w-4 h-4 text-charcoal-400 shrink-0" />
                          <span>{booking.barber.name}</span>
                          {booking.barber.specialization && (
                            <span className="text-micro text-charcoal-400">
                              ({booking.barber.specialization})
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCancelled && (
                        <div className="mt-3 pt-3 border-t border-line/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setBookingToCancel(booking)}
                            className="px-3 py-1.5 border border-line bg-paper-100 hover:bg-status-cancelled-bg hover:text-status-cancelled-text hover:border-status-cancelled-border text-charcoal-600 rounded-sm text-micro font-mono transition-colors"
                          >
                            {t('my_bookings.cancel_btn')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={bookingToCancel !== null}
        title={t('confirm.cancel_title')}
        message={t('my_bookings.cancel_confirm')}
        confirmLabel={t('confirm.cancel_confirm')}
        cancelLabel={t('confirm.cancel_keep')}
        isDestructive={true}
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (bookingToCancel) {
            cancelMutation.mutate(bookingToCancel.id);
          }
        }}
        onCancel={() => setBookingToCancel(null)}
      />
    </>
  );
};
