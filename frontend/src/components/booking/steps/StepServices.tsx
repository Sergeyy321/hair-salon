import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Service } from '../../../types/booking';
import { Clock } from 'lucide-react';
import { getLocalizedServiceDescription } from '../../../features/timeline/serviceLocalization';

interface StepServicesProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

export const StepServices: React.FC<StepServicesProps> = ({
  services,
  selectedServiceId,
  onSelectService,
}) => {
  const { t, i18n } = useTranslation();

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-display text-charcoal-900 tracking-tight">
          {t('booking.select_service_title')}
        </h2>
        <p className="text-body text-charcoal-500 mt-1">
          {t('app.brand')} — {t('app.tagline')}
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryServices = services.filter((s) => s.category === cat);
          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500">
                  {cat}
                </span>
                <div className="flex-1 h-[1px] bg-line" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryServices.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => onSelectService(service.id)}
                      className={`p-4 border transition-all cursor-pointer rounded-sm flex flex-col justify-between ${
                        isSelected
                          ? 'border-charcoal-900 bg-paper-200 ring-1 ring-charcoal-900'
                          : 'border-line bg-paper-50 hover:border-charcoal-700 hover:bg-paper-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-serif text-headline font-semibold text-charcoal-900 leading-snug">
                            {service.name}
                          </h3>
                          <span className="font-serif text-headline font-bold text-charcoal-900 tabular-nums shrink-0">
                            {service.price} zł
                          </span>
                        </div>
                        <p className="text-label text-charcoal-500 mt-1.5 leading-relaxed">
                          {getLocalizedServiceDescription(service, i18n.language)}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-micro text-charcoal-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {service.durationMin} {t('booking.duration')}
                          </span>
                        </div>
                        <span
                          className={`text-micro uppercase font-medium ${
                            isSelected ? 'text-charcoal-900' : 'text-charcoal-500'
                          }`}
                        >
                          {isSelected
                            ? (i18n.language.startsWith('pl') ? '✓ WYBRANO' : '✓ SELECTED')
                            : (i18n.language.startsWith('pl') ? 'WYBIERZ' : 'SELECT')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
