import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Service, StaffMember } from '../../types/booking';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface BookingSummaryDockProps {
  currentStep: number;
  service: Service | undefined;
  staff: StaffMember | undefined;
  isAnyStaff: boolean;
  selectedDate: string;
  selectedTime: string | null;
  canProceed: boolean;
  isSubmitting?: boolean;
  onNext: () => void;
  onBack: () => void;
}

export const BookingSummaryDock: React.FC<BookingSummaryDockProps> = ({
  currentStep,
  service,
  staff,
  isAnyStaff,
  selectedDate,
  selectedTime,
  canProceed,
  isSubmitting = false,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();

  if (currentStep > 4) {
    return null;
  }

  const staffName = isAnyStaff ? t('booking.any_master') : staff?.name;

  return (
    <footer className="sticky bottom-0 left-0 right-0 z-30 bg-paper-100/95 backdrop-blur-none border-t border-line px-4 py-3 select-none">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {currentStep > 1 && (
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="w-10 h-10 border border-line bg-paper-50 hover:bg-paper-200 rounded-sm flex items-center justify-center text-charcoal-700 transition-colors shrink-0 disabled:opacity-50"
              title={t('booking.btn_back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            {service ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-body text-charcoal-900 truncate">
                    {service.name}
                  </span>
                  <span className="font-serif text-body font-bold text-charcoal-900 shrink-0">
                    {service.price} zł
                  </span>
                </div>
                <div className="text-micro font-mono text-charcoal-500 truncate flex items-center gap-2">
                  {staffName && <span>{staffName}</span>}
                  {selectedTime && (
                    <>
                      <span>•</span>
                      <span>{selectedDate} {selectedTime}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-label text-charcoal-500 italic">
                {t('booking.select_service_title')}
              </span>
            )}
          </div>
        </div>

        <button
          disabled={!canProceed || isSubmitting}
          onClick={onNext}
          className={`px-5 py-2.5 rounded-sm text-label font-medium transition-all flex items-center gap-2 shrink-0 ${
            canProceed && !isSubmitting
              ? 'bg-charcoal-900 text-paper-50 hover:bg-charcoal-700'
              : 'border border-line bg-paper-200 text-charcoal-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span>{t('appointment_modal.booking')}</span>
          ) : (
            <>
              <span>
                {currentStep === 4 ? t('booking.btn_confirm') : t('booking.btn_next')}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </footer>
  );
};
