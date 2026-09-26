import React from 'react';
import { useTranslation } from 'react-i18next';

interface StepDetailsProps {
  name: string;
  phone: string;
  email: string;
  notes: string;
  onChange: (field: 'clientName' | 'clientPhone' | 'clientEmail' | 'notes', value: string) => void;
}

export const StepDetails: React.FC<StepDetailsProps> = ({
  name,
  phone,
  email,
  notes,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-display text-charcoal-900 tracking-tight">
          {t('booking.client_details_title')}
        </h2>
        <p className="text-body text-charcoal-500 mt-1">
          {t('booking.success_desc')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('booking.field_name')} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onChange('clientName', e.target.value)}
            placeholder="np. Anna Nowak"
            className="w-full px-3.5 py-2.5 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 focus:outline-none focus:border-charcoal-900 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
              {t('booking.field_phone')} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => onChange('clientPhone', e.target.value)}
              placeholder="+48 000 000 000"
              className="w-full px-3.5 py-2.5 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-900 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
              {t('booking.field_email')} *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onChange('clientEmail', e.target.value)}
              placeholder="adres@domena.pl"
              className="w-full px-3.5 py-2.5 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-900 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-micro font-mono uppercase tracking-wider text-charcoal-500 block">
            {t('booking.field_notes')}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Alergie, preferowane produkty, uwagi do fryzury..."
            className="w-full px-3.5 py-2.5 bg-paper-50 border border-line rounded-sm text-body text-charcoal-700 focus:outline-none focus:border-charcoal-900 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};
