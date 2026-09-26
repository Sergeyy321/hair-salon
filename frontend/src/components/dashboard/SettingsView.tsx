import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLogto } from '@logto/react';
import { Globe, Building, Clock, ShieldCheck, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useLogto();

  const handleLanguageChange = (lng: 'pl' | 'en') => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-paper-100 overflow-y-auto select-none p-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
            PREFERENCES
          </span>
          <h1 className="font-serif text-display font-bold text-charcoal-900 mt-1">
            Settings & Atelier Config
          </h1>
          <p className="text-body text-charcoal-500 mt-1">
            Configure system language, salon operational schedule, and integration settings.
          </p>
        </div>

        <div className="border border-line rounded-sm bg-paper-50 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-line rounded-sm bg-paper-100 flex items-center justify-center text-charcoal-700 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-headline font-bold text-charcoal-900">
                Interface Language
              </h3>
              <p className="text-body text-charcoal-500 mt-0.5">
                Select your preferred language for dates, notifications, and navigation.
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleLanguageChange('pl')}
                  className={`px-4 py-2 border rounded-sm text-label font-mono flex items-center gap-2 transition-colors ${
                    i18n.language.startsWith('pl')
                      ? 'bg-charcoal-900 text-paper-50 border-charcoal-900 font-bold'
                      : 'bg-paper-100 text-charcoal-700 border-line hover:border-charcoal-700'
                  }`}
                >
                  {i18n.language.startsWith('pl') && <Check className="w-4 h-4 text-terracotta-500" />}
                  <span>Polski (PL)</span>
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-2 border rounded-sm text-label font-mono flex items-center gap-2 transition-colors ${
                    i18n.language.startsWith('en')
                      ? 'bg-charcoal-900 text-paper-50 border-charcoal-900 font-bold'
                      : 'bg-paper-100 text-charcoal-700 border-line hover:border-charcoal-700'
                  }`}
                >
                  {i18n.language.startsWith('en') && <Check className="w-4 h-4 text-terracotta-500" />}
                  <span>English (EN)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-line rounded-sm bg-paper-50 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-line rounded-sm bg-paper-100 flex items-center justify-center text-charcoal-700 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-headline font-bold text-charcoal-900">
                Atelier Location & Hours
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4 font-mono text-label">
                <div className="p-3 bg-paper-100 border border-line rounded-sm space-y-1">
                  <span className="text-micro uppercase text-charcoal-500 block">Salon Address</span>
                  <span className="font-semibold text-charcoal-900 block">ul. Mokotowska 46, Warsaw</span>
                  <span className="text-micro text-charcoal-400 block">+48 22 890 12 34</span>
                </div>
                <div className="p-3 bg-paper-100 border border-line rounded-sm space-y-1">
                  <div className="flex items-center gap-1.5 text-micro uppercase text-charcoal-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Operating Hours</span>
                  </div>
                  <span className="font-semibold text-charcoal-900 block">Mon - Sat: 08:00 - 19:00</span>
                  <span className="text-micro text-charcoal-400 block">Sunday: Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-line rounded-sm bg-paper-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-line rounded-sm bg-paper-100 flex items-center justify-center text-charcoal-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-headline font-bold text-charcoal-900">
                Authentication & Security
              </h3>
              <p className="text-body text-charcoal-500 mt-0.5">
                Authentication provided by Logto OIDC Cloud Service.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-label">
                <span className="text-charcoal-500">Status:</span>
                <span className={`px-2 py-0.5 rounded-sm text-micro font-semibold ${
                  isAuthenticated
                    ? 'bg-status-confirmed-bg text-status-confirmed-text border border-status-confirmed-border'
                    : 'bg-paper-200 text-charcoal-600 border border-line'
                }`}>
                  {isAuthenticated ? 'Authenticated (Salon Director)' : 'Guest Session'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
