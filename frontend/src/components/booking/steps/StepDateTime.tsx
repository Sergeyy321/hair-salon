import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchBarberAvailability, type BarberApi } from '../../../lib/api';

interface StepDateTimeProps {
  selectedDate: string;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  selectedBarberId?: string | null;
  selectedServiceDurationMin?: number;
  barbers?: BarberApi[];
}

export const StepDateTime: React.FC<StepDateTimeProps> = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  selectedBarberId,
  selectedServiceDurationMin,
  barbers,
}) => {
  const { t, i18n } = useTranslation();

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const weekday = new Intl.DateTimeFormat(
        i18n.language.startsWith('pl') ? 'pl-PL' : 'en-US',
        { weekday: 'short' }
      ).format(d);
      const dayNumber = d.getDate();
      return { iso, weekday, dayNumber };
    });
  }, [i18n.language]);

  const targetBarberIds = useMemo(() => {
    if (selectedBarberId && selectedBarberId !== 'ANY') {
      return [selectedBarberId];
    }
    return (barbers ?? []).map((b) => b.id);
  }, [selectedBarberId, barbers]);

  const { data: busyPerBarber = [] } = useQuery({
    queryKey: ['barber-availability', targetBarberIds, selectedDate],
    queryFn: async () => {
      if (targetBarberIds.length === 0) return [];
      return Promise.all(
        targetBarberIds.map((id) =>
          fetchBarberAvailability(id, selectedDate).catch(() => [])
        )
      );
    },
    enabled: Boolean(selectedDate && targetBarberIds.length > 0),
  });

  const candidateTimes = useMemo(
    () => [
      { time: '08:30', period: 'morning' as const },
      { time: '09:15', period: 'morning' as const },
      { time: '10:00', period: 'morning' as const },
      { time: '10:45', period: 'morning' as const },
      { time: '11:30', period: 'morning' as const },
      { time: '12:15', period: 'afternoon' as const },
      { time: '13:00', period: 'afternoon' as const },
      { time: '13:45', period: 'afternoon' as const },
      { time: '14:30', period: 'afternoon' as const },
      { time: '15:15', period: 'afternoon' as const },
      { time: '16:00', period: 'evening' as const },
      { time: '16:45', period: 'evening' as const },
      { time: '17:15', period: 'evening' as const },
    ],
    []
  );

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = selectedDate === todayIso;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const duration = selectedServiceDurationMin ?? 60;

  const computedSlots = useMemo(() => {
    return candidateTimes.map((item) => {
      const parts = item.time.split(':');
      const h = Number(parts[0]) || 0;
      const m = Number(parts[1]) || 0;
      const slotStartMinutes = h * 60 + m;
      const slotEndMinutes = slotStartMinutes + duration;

      if (slotEndMinutes > 18 * 60) {
        return { ...item, available: false };
      }

      if (isToday && slotStartMinutes <= currentMinutes + 15) {
        return { ...item, available: false };
      }

      if (targetBarberIds.length === 0 || busyPerBarber.length === 0) {
        return { ...item, available: true };
      }

      const isAnyBarberFree = targetBarberIds.some((_, idx) => {
        const barberBusyList = busyPerBarber[idx] ?? [];
        const overlaps = barberBusyList.some((busy) => {
          const bStart = new Date(busy.startTime);
          const bEnd = new Date(busy.endTime);
          const busyStartMinutes = bStart.getHours() * 60 + bStart.getMinutes();
          const busyEndMinutes = bEnd.getHours() * 60 + bEnd.getMinutes();
          return slotStartMinutes < busyEndMinutes && slotEndMinutes > busyStartMinutes;
        });
        return !overlaps;
      });

      return {
        ...item,
        available: isAnyBarberFree,
      };
    });
  }, [candidateTimes, duration, isToday, currentMinutes, targetBarberIds, busyPerBarber]);

  const morningSlots = computedSlots.filter((s) => s.period === 'morning');
  const afternoonSlots = computedSlots.filter((s) => s.period === 'afternoon');
  const eveningSlots = computedSlots.filter((s) => s.period === 'evening');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-display text-charcoal-900 tracking-tight">
          {t('booking.select_time_title')}
        </h2>
        <p className="text-body text-charcoal-500 mt-1">
          {t('timeline.duty')}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isSelected = selectedDate === d.iso;
          return (
            <button
              key={d.iso}
              onClick={() => onSelectDate(d.iso)}
              className={`p-3 border rounded-sm flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'border-charcoal-900 bg-charcoal-900 text-paper-50 ring-1 ring-charcoal-900'
                  : 'border-line bg-paper-50 text-charcoal-700 hover:border-charcoal-700 hover:bg-paper-100'
              }`}
            >
              <span className="text-micro font-mono uppercase tracking-wider opacity-75">
                {d.weekday}
              </span>
              <span className="font-serif text-headline font-bold mt-1">
                {d.dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-5 pt-2">
        <div className="space-y-2.5">
          <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500">
            {t('booking.morning')}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {morningSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                className={`py-3 px-2 border rounded-sm text-body font-mono transition-all ${
                  !slot.available
                    ? 'border-line-light bg-paper-200/50 text-charcoal-300 cursor-not-allowed line-through'
                    : selectedTime === slot.time
                    ? 'border-charcoal-900 bg-paper-200 text-charcoal-900 font-bold ring-1 ring-charcoal-900'
                    : 'border-line bg-paper-50 hover:border-charcoal-700 text-charcoal-900'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500">
            {t('booking.afternoon')}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {afternoonSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                className={`py-3 px-2 border rounded-sm text-body font-mono transition-all ${
                  !slot.available
                    ? 'border-line-light bg-paper-200/50 text-charcoal-300 cursor-not-allowed line-through'
                    : selectedTime === slot.time
                    ? 'border-charcoal-900 bg-paper-200 text-charcoal-900 font-bold ring-1 ring-charcoal-900'
                    : 'border-line bg-paper-50 hover:border-charcoal-700 text-charcoal-900'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500">
            {t('booking.evening')}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {eveningSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                className={`py-3 px-2 border rounded-sm text-body font-mono transition-all ${
                  !slot.available
                    ? 'border-line-light bg-paper-200/50 text-charcoal-300 cursor-not-allowed line-through'
                    : selectedTime === slot.time
                    ? 'border-charcoal-900 bg-paper-200 text-charcoal-900 font-bold ring-1 ring-charcoal-900'
                    : 'border-line bg-paper-50 hover:border-charcoal-700 text-charcoal-900'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
