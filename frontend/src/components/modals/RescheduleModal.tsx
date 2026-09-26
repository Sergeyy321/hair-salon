import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { BookingApi } from '../../lib/api';

interface RescheduleModalProps {
  booking: BookingApi | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTime, setSelectedTime] = useState<string>('11:00');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] ?? '';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPl = i18n.language.startsWith('pl');

  const initialViewDate = useMemo(() => {
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [selectedDate]);

  const [calendarViewDate, setCalendarViewDate] = useState<Date>(initialViewDate);

  const weekDays = useMemo(() => {
    return isPl
      ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  }, [isPl]);

  const monthYearLabel = useMemo(() => {
    return new Intl.DateTimeFormat(isPl ? 'pl-PL' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(calendarViewDate);
  }, [calendarViewDate, isPl]);

  const daysGrid = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, 0).getDate() - startingDayOfWeek + i + 1;
      const d = new Date(year, month - 1, prevMonthDay);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      days.push({
        day: prevMonthDay,
        dateStr: `${y}-${m}-${dayNum}`,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const y = year;
      const m = String(month + 1).padStart(2, '0');
      const dayNum = String(i).padStart(2, '0');
      days.push({
        day: i,
        dateStr: `${y}-${m}-${dayNum}`,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [calendarViewDate]);

  const changeMonth = (offset: number) => {
    setCalendarViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      const apiBase = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

      const parts = selectedTime.split(':');
      const hours = Number(parts[0]) || 10;
      const minutes = Number(parts[1]) || 0;

      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y || 2026, (m || 1) - 1, d || 1, hours, minutes, 0, 0);

      const res = await fetch(`${apiBase}/api/bookings/${booking.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: dateObj.toISOString() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'FAILED_TO_RESCHEDULE');
      }

      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
    },
    onError: (err: Error) => {
      setErrorMessage(err.message === 'SLOT_ALREADY_BOOKED' ? t('reschedule.slot_booked') : t('reschedule.error'));
    },
  });

  if (!isOpen || !booking) {
    return null;
  }

  const timeSlots = [
    '08:30', '09:15', '10:00', '10:45',
    '11:30', '12:15', '13:00', '13:45',
    '14:30', '15:15', '16:00', '16:45',
  ];

  const selectedDateFormatted = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const parsedDate = new Date(y || 2026, (m || 1) - 1, d || 1);
      return new Intl.DateTimeFormat(isPl ? 'pl-PL' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(parsedDate);
    } catch {
      return selectedDate;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 select-none">
      <div className="w-full max-w-lg bg-paper-100 border border-line rounded-sm flex flex-col overflow-hidden max-h-[92vh]">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper-50">
          <div>
            <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
              {t('reschedule.eyebrow')}
            </span>
            <h2 className="font-serif text-headline font-bold text-charcoal-900 mt-0.5">
              {t('reschedule.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-charcoal-500 hover:bg-paper-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-status-cancelled-bg border border-status-cancelled-border text-status-cancelled-text text-label rounded-sm">
              {errorMessage}
            </div>
          )}

          <div className="p-3.5 bg-paper-50 border border-line rounded-sm space-y-1 text-label font-mono">
            <div className="flex justify-between">
              <span className="text-charcoal-500">{t('reschedule.client')}</span>
              <span className="font-semibold text-charcoal-900">{booking.client.name ?? booking.client.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">{t('reschedule.service')}</span>
              <span className="font-semibold text-charcoal-900">{booking.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">{t('reschedule.stylist')}</span>
              <span className="font-semibold text-charcoal-900">{booking.barber.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-micro font-mono uppercase text-charcoal-500 block">
                {t('reschedule.select_date')}
              </label>
              <div className="flex items-center gap-1.5 text-micro font-mono text-charcoal-600 bg-paper-50 px-2 py-0.5 border border-line rounded-sm">
                <CalendarIcon className="w-3 h-3 text-terracotta-500" />
                <span>{selectedDateFormatted}</span>
              </div>
            </div>

            <div className="border border-line bg-paper-50 rounded-sm p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-7 h-7 border border-line bg-paper-100 hover:bg-paper-200 rounded-sm flex items-center justify-center text-charcoal-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-serif font-bold capitalize text-charcoal-900 text-body">
                  {monthYearLabel}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-7 h-7 border border-line bg-paper-100 hover:bg-paper-200 rounded-sm flex items-center justify-center text-charcoal-700 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {weekDays.map((wd) => (
                  <span key={wd} className="text-micro font-mono uppercase text-charcoal-400 py-1 font-semibold">
                    {wd}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysGrid.map((item, idx) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={`${item.dateStr}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                      }}
                      className={`h-8 rounded-sm font-mono text-label transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'bg-charcoal-900 text-paper-50 font-bold'
                          : item.isCurrentMonth
                          ? 'text-charcoal-900 hover:bg-paper-200'
                          : 'text-charcoal-300 hover:text-charcoal-600'
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-micro font-mono uppercase text-charcoal-500 block">
              {t('reschedule.select_time')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 border rounded-sm font-mono text-label transition-all ${
                      isSelected
                        ? 'border-charcoal-900 bg-charcoal-900 text-paper-50 font-bold'
                        : 'border-line bg-paper-50 hover:border-charcoal-700 text-charcoal-900'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-line bg-paper-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-line bg-paper-100 text-charcoal-700 text-label rounded-sm hover:bg-paper-200 transition-colors"
          >
            {t('reschedule.cancel')}
          </button>

          <button
            type="button"
            disabled={rescheduleMutation.isPending}
            onClick={() => rescheduleMutation.mutate()}
            className="px-5 py-2 bg-charcoal-900 text-paper-50 text-label font-medium rounded-sm hover:bg-charcoal-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{rescheduleMutation.isPending ? t('reschedule.saving') : t('reschedule.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
