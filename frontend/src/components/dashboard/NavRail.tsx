import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';

interface NavRailProps {
  currentTab: 'schedule' | 'staff' | 'services';
  onTabChange: (tab: 'schedule' | 'staff' | 'services') => void;
  activeView: 'admin' | 'client';
  onViewChange: (view: 'admin' | 'client') => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  currentTab,
  onTabChange,
  activeView,
  onViewChange,
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lng: 'pl' | 'en') => {
    void i18n.changeLanguage(lng);
  };

  return (
    <aside className="h-full bg-paper-200 border-r border-line flex flex-col justify-between items-center py-4 select-none">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 border border-charcoal-900 bg-paper-100 flex items-center justify-center">
          <span className="font-serif text-xl font-bold text-charcoal-900 tracking-tighter">L</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => onTabChange('schedule')}
            title={t('nav.schedule')}
            className={`w-10 h-10 flex items-center justify-center rounded-sm transition-colors ${
              currentTab === 'schedule'
                ? 'bg-charcoal-900 text-paper-50'
                : 'text-charcoal-500 hover:bg-paper-300 hover:text-charcoal-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTabChange('staff')}
            title={t('nav.masters')}
            className={`w-10 h-10 flex items-center justify-center rounded-sm transition-colors ${
              currentTab === 'staff'
                ? 'bg-charcoal-900 text-paper-50'
                : 'text-charcoal-500 hover:bg-paper-300 hover:text-charcoal-900'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTabChange('services')}
            title={t('nav.services')}
            className={`w-10 h-10 flex items-center justify-center rounded-sm transition-colors ${
              currentTab === 'services'
                ? 'bg-charcoal-900 text-paper-50'
                : 'text-charcoal-500 hover:bg-paper-300 hover:text-charcoal-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </nav>

        <div className="w-6 h-[1px] bg-line" />

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onViewChange(activeView === 'admin' ? 'client' : 'admin')}
            title={activeView === 'admin' ? t('nav.client_view') : t('nav.admin_view')}
            className={`w-10 h-10 flex items-center justify-center border border-line rounded-sm transition-colors ${
              activeView === 'client'
                ? 'bg-terracotta text-paper-50 border-terracotta'
                : 'bg-paper-100 text-charcoal-700 hover:bg-paper-300'
            }`}
          >
            {activeView === 'admin' ? <Smartphone className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-micro font-mono">
        <div className="flex flex-col border border-line bg-paper-100 p-0.5 rounded-sm">
          <button
            onClick={() => handleLanguageChange('pl')}
            className={`px-1.5 py-1 text-micro transition-colors ${
              i18n.language.startsWith('pl')
                ? 'bg-charcoal-900 text-paper-50 font-semibold'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            PL
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-1.5 py-1 text-micro transition-colors ${
              i18n.language.startsWith('en')
                ? 'bg-charcoal-900 text-paper-50 font-semibold'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </aside>
  );
};
