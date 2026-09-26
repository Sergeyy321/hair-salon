import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { HeaderProfile } from './HeaderProfile';

interface TopHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) => {
  const { t, i18n } = useTranslation();

  const formattedDate = new Intl.DateTimeFormat(
    i18n.language.startsWith('pl') ? 'pl-PL' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' }
  ).format(currentDate);

  const shiftDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  };

  const setToday = () => {
    onDateChange(new Date());
  };

  return (
    <header className="h-16 bg-paper-100 border-b border-line px-6 flex items-center justify-between gap-6 select-none shrink-0">
      <div className="flex-1 max-w-sm relative">
        <Search className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('header.search_placeholder')}
          className="w-full pl-9 pr-4 py-2 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-charcoal-900 transition-colors"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-1.5 bg-charcoal-900 text-paper-50 hover:bg-charcoal-700 transition-colors text-label font-medium rounded-sm flex items-center gap-1.5 shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>{t('header.add_appointment')}</span>
        </button>

        <div className="h-5 w-[1px] bg-line" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={setToday}
            className="px-3 h-8 text-label border border-line bg-paper-50 text-charcoal-900 rounded-sm font-medium hover:bg-paper-200 transition-colors font-mono"
          >
            {formattedDate}
          </button>
          <button
            onClick={() => shiftDate(1)}
            className="w-8 h-8 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-line" />

        <HeaderProfile />
      </div>
    </header>
  );
};
