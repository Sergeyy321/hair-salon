import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  Settings,
  ExternalLink,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'appointments' | 'clients' | 'services' | 'staff' | 'settings';

interface SidebarNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSwitchToClient?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { t, i18n } = useTranslation();

  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'appointments', label: t('nav.appointments'), icon: Calendar },
    { id: 'clients', label: t('nav.clients'), icon: Users },
    { id: 'services', label: t('nav.services'), icon: Scissors },
    { id: 'staff', label: t('nav.staff'), icon: UserCheck },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const handleLanguageChange = (lng: 'pl' | 'en') => {
    void i18n.changeLanguage(lng);
  };

  return (
    <aside className="w-60 h-full bg-paper-200 border-r border-line flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 border border-charcoal-900 bg-paper-100 flex items-center justify-center shrink-0">
            <span className="font-serif text-xl font-bold text-charcoal-900 tracking-tighter">L</span>
          </div>
          <div className="min-w-0">
            <span className="font-serif text-headline font-bold text-charcoal-900 tracking-tight leading-none block">
              {t('app.brand')}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-charcoal-500 uppercase mt-0.5 block truncate">
              {t('app.tagline')}
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-body transition-colors text-left ${
                  isActive
                    ? 'bg-charcoal-900 text-paper-50 font-medium'
                    : 'text-charcoal-700 hover:bg-paper-300 hover:text-charcoal-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-paper-50' : 'text-charcoal-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-line">
        <Link
          to="/book"
          className="w-full flex items-center justify-between px-3 py-2 border border-line bg-paper-100 hover:bg-paper-300 rounded-sm text-label text-charcoal-700 transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="w-3.5 h-3.5 text-charcoal-500 group-hover:text-charcoal-900 shrink-0 transition-colors" />
            <span className="truncate">{t('nav.client_preview')}</span>
          </div>
        </Link>

        <div className="flex items-center justify-between px-1 text-micro font-mono text-charcoal-500">
          <span>{t('settings.language')}</span>
          <div className="flex border border-line bg-paper-100 p-0.5 rounded-sm">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                i18n.language.startsWith('en')
                  ? 'bg-charcoal-900 text-paper-50 font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('pl')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                i18n.language.startsWith('pl')
                  ? 'bg-charcoal-900 text-paper-50 font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              PL
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
