import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StaffMember } from '../../../types/booking';
import { Sparkles } from 'lucide-react';

interface StepStaffProps {
  staffList: StaffMember[];
  selectedBarberId: string | null;
  onSelectBarber: (barberId: string) => void;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
}

export const StepStaff: React.FC<StepStaffProps> = ({
  staffList,
  selectedBarberId,
  onSelectBarber,
  currentUserId,
  currentUserEmail,
}) => {
  const { t } = useTranslation();

  const selectableStaff = staffList.filter((staff) => {
    if (currentUserId && staff.id === currentUserId) return false;
    if (currentUserEmail && staff.email && staff.email.toLowerCase() === currentUserEmail.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-display text-charcoal-900 tracking-tight">
          {t('booking.select_master_title')}
        </h2>
        <p className="text-body text-charcoal-500 mt-1">
          {t('booking.any_master_desc')}
        </p>
      </div>

      <div className="space-y-3">
        <div
          onClick={() => onSelectBarber('ANY')}
          className={`p-4 border transition-all cursor-pointer rounded-sm flex items-center justify-between ${
            selectedBarberId === 'ANY'
              ? 'border-charcoal-900 bg-paper-200 ring-1 ring-charcoal-900'
              : 'border-line bg-paper-50 hover:border-charcoal-700 hover:bg-paper-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-line-dark rounded-sm bg-paper-200 flex items-center justify-center text-charcoal-900">
              <Sparkles className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <h3 className="font-serif text-headline font-semibold text-charcoal-900">
                {t('booking.any_master')}
              </h3>
              <p className="text-label text-charcoal-500 mt-0.5">
                {t('booking.any_master_desc')}
              </p>
            </div>
          </div>
          <span className="text-micro font-mono text-charcoal-500 uppercase">
            {selectedBarberId === 'ANY' ? '✓ WYBRANO' : 'WYBIERZ'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {selectableStaff.map((staff) => {
            const isSelected = selectedBarberId === staff.id;
            return (
              <div
                key={staff.id}
                onClick={() => onSelectBarber(staff.id)}
                className={`p-4 border transition-all cursor-pointer rounded-sm flex items-center justify-between ${
                  isSelected
                    ? 'border-charcoal-900 bg-paper-200 ring-1 ring-charcoal-900'
                    : 'border-line bg-paper-50 hover:border-charcoal-700 hover:bg-paper-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 border border-line-dark rounded-sm bg-paper-200 flex items-center justify-center text-charcoal-900 font-serif text-lg font-bold">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-headline font-semibold text-charcoal-900">
                      {staff.name}
                    </h3>
                    <p className="text-label text-charcoal-500 font-mono mt-0.5">
                      {staff.specialization}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-micro font-mono text-charcoal-500 uppercase">
                    {isSelected ? '✓ WYBRANO' : 'WYBIERZ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
