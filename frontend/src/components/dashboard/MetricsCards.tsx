import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, TrendingUp } from 'lucide-react';

interface MetricsCardsProps {
  totalBookings: number;
  occupancyPercent: number;
  projectedRevenue: string;
  newClientsCount: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalBookings,
  occupancyPercent,
  projectedRevenue,
  newClientsCount,
}) => {
  const { t } = useTranslation();

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyPercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-paper-100 border-b border-line select-none shrink-0">
      <div className="p-4 bg-paper-50 border border-line rounded-sm flex items-start justify-between">
        <div>
          <span className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('metrics.todays_bookings')}
          </span>
          <div className="font-serif text-metric font-bold text-charcoal-900 mt-1 tabular-nums">
            {totalBookings}
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 block mt-1">
            +12% {t('metrics.vs_last_week')}
          </span>
        </div>
        <div className="w-9 h-9 border border-line rounded-sm bg-paper-200 flex items-center justify-center text-charcoal-700 shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      <div className="p-4 bg-paper-50 border border-line rounded-sm flex items-start justify-between">
        <div>
          <span className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('metrics.occupancy_rate')}
          </span>
          <div className="font-serif text-metric font-bold text-charcoal-900 mt-1 tabular-nums">
            {occupancyPercent}%
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 block mt-1">
            {((occupancyPercent / 100) * 10).toFixed(1)}h / 10h booked
          </span>
        </div>

        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r={radius}
              className="stroke-paper-300"
              strokeWidth="3.5"
              fill="none"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              className="stroke-terracotta transition-all duration-500 ease-out"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="absolute text-[10px] font-mono font-semibold text-charcoal-900">
            {occupancyPercent}%
          </span>
        </div>
      </div>

      <div className="p-4 bg-paper-50 border border-line rounded-sm flex items-start justify-between">
        <div>
          <span className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('metrics.revenue')}
          </span>
          <div className="font-serif text-metric font-bold text-charcoal-900 mt-1 tabular-nums">
            {projectedRevenue}
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 block mt-1">
            +8% {t('metrics.vs_last_week')}
          </span>
        </div>
        <div className="w-9 h-9 border border-line rounded-sm bg-paper-200 flex items-center justify-center text-charcoal-700 shrink-0">
          <TrendingUp className="w-4 h-4 text-terracotta" />
        </div>
      </div>

      <div className="p-4 bg-paper-50 border border-line rounded-sm flex items-start justify-between">
        <div>
          <span className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('metrics.new_clients')}
          </span>
          <div className="font-serif text-metric font-bold text-charcoal-900 mt-1 tabular-nums">
            {newClientsCount}
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 block mt-1">
            First visit at Lumé
          </span>
        </div>
        <div className="flex -space-x-2 shrink-0 pt-1">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
            alt="Client"
            className="w-7 h-7 rounded-full object-cover border-2 border-paper-50"
          />
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
            alt="Client"
            className="w-7 h-7 rounded-full object-cover border-2 border-paper-50"
          />
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
            alt="Client"
            className="w-7 h-7 rounded-full object-cover border-2 border-paper-50"
          />
        </div>
      </div>
    </div>
  );
};
