import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Service, StaffMember } from '../../../types/booking';
import { Check, Calendar, Clock, User, Scissors } from 'lucide-react';

interface StepConfirmationProps {
  service: Service | undefined;
  staff: StaffMember | undefined;
  isAnyStaff: boolean;
  date: string;
  time: string | null;
  clientName: string;
  onReset: () => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  service,
  staff,
  isAnyStaff,
  date,
  time,
  clientName,
  onReset,
}) => {
  const { t } = useTranslation();
  const [bookingReference] = useState(() => 'LM-' + Math.floor(1000 + Math.random() * 9000));

  return (
    <div className="max-w-xl mx-auto py-8 text-center space-y-6">
      <div className="w-14 h-14 border border-charcoal-900 bg-paper-50 rounded-sm mx-auto flex items-center justify-center text-charcoal-900">
        <Check className="w-7 h-7 stroke-[2]" />
      </div>

      <div className="space-y-2">
        <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500">
          {bookingReference}
        </span>
        <h2 className="font-serif text-display text-charcoal-900 tracking-tight font-semibold">
          {t('booking.success_heading')}
        </h2>
        <p className="text-body text-charcoal-500 max-w-md mx-auto">
          {t('booking.success_desc')}
        </p>
      </div>

      <div className="p-6 bg-paper-50 border border-line rounded-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 text-charcoal-900 font-serif text-headline font-semibold">
            <Scissors className="w-4 h-4 text-terracotta" />
            <span>{service?.name}</span>
          </div>
          <span className="font-serif text-headline font-bold text-charcoal-900">
            {service?.price} zł
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-label">
          <div className="space-y-1">
            <span className="text-micro font-mono uppercase text-charcoal-500 block">
              {t('booking.step2_master')}
            </span>
            <div className="flex items-center gap-1.5 text-charcoal-900 font-medium">
              <User className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{isAnyStaff ? t('booking.any_master') : staff?.name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-micro font-mono uppercase text-charcoal-500 block">
              {t('booking.step3_time')}
            </span>
            <div className="flex items-center gap-1.5 text-charcoal-900 font-mono font-medium">
              <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{date}</span>
              <Clock className="w-3.5 h-3.5 text-charcoal-500 ml-1" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-line flex items-center justify-between text-micro font-mono text-charcoal-500">
          <span>{clientName}</span>
          <span>{t('booking.total_due')}</span>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onReset}
          className="px-6 py-3 border border-charcoal-900 bg-charcoal-900 text-paper-50 text-label font-medium rounded-sm hover:bg-charcoal-700 transition-colors"
        >
          {t('booking.btn_new')}
        </button>
      </div>
    </div>
  );
};
