import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MetricsBarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  occupancyPercent: number;
  totalBookings: number;
  openSlots: number;
  projectedRevenue: string;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  currentDate,
  onDateChange,
  occupancyPercent,
  totalBookings,
  openSlots,
  projectedRevenue,
}) => {
  const { t, i18n } = useTranslation();

  const formattedDate = new Intl.DateTimeFormat(
    i18n.language.startsWith('pl') ? 'pl-PL' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' }
  ).format(currentDate);

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const shiftDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  };

  const setToday = () => {
    onDateChange(new Date());
  };

  return (
    <header className="h-14 bg-paper-100 border-b border-line px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-headline text-charcoal-900 tracking-tight font-medium">
            {capitalizedDate}
          </h1>
          <span className="text-micro text-charcoal-500 uppercase tracking-widest font-mono">
            {t('app.brand')} 2026
          </span>
        </div>

        <div className="h-4 w-[1px] bg-line" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftDate(-1)}
            className="w-7 h-7 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={setToday}
            className="px-2.5 h-7 text-label border border-charcoal-900 bg-charcoal-900 text-paper-50 rounded-sm font-medium hover:bg-charcoal-700 transition-colors"
          >
            {t('date.today')}
          </button>
          <button
            onClick={() => shiftDate(1)}
            className="w-7 h-7 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 text-charcoal-700">
        <div className="flex items-baseline gap-2">
          <span className="text-micro uppercase text-charcoal-500 tracking-wider">
            {t('metrics.occupancy')}:
          </span>
          <span className="font-sans font-semibold text-body text-charcoal-900 tabular-nums">
            {occupancyPercent}%
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-micro uppercase text-charcoal-500 tracking-wider">
            {t('metrics.bookings')}:
          </span>
          <span className="font-sans font-semibold text-body text-charcoal-900 tabular-nums">
            {totalBookings}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-micro uppercase text-charcoal-500 tracking-wider">
            {t('metrics.open_slots')}:
          </span>
          <span className="font-sans font-semibold text-body text-charcoal-900 tabular-nums">
            {openSlots}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-micro uppercase text-charcoal-500 tracking-wider">
            {t('metrics.revenue')}:
          </span>
          <span className="font-serif text-lg font-bold text-charcoal-900 tabular-nums">
            {projectedRevenue}
          </span>
        </div>
      </div>
    </header>
  );
};
