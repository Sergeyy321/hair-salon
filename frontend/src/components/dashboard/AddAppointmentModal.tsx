import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';
import type { BarberApi, ServiceApi } from '../../lib/api';
import { createBooking } from '../../lib/api';
import { getLocalizedServiceDescription } from '../../features/timeline/serviceLocalization';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: BarberApi[];
  services: ServiceApi[];
  currentDate: Date;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  barbers,
  services,
  currentDate,
}) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? '');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id ?? '');
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) ?? barbers[0];

  const categories = Array.from(new Set(services.map((s) => s.category ?? 'General')));
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? 'General');

  const createMutation = useMutation({
    mutationFn: async () => {
      const parts = selectedTime.split(':');
      const hours = Number(parts[0]) || 10;
      const minutes = Number(parts[1]) || 0;

      const dateObj = new Date(currentDate);
      dateObj.setHours(hours, minutes, 0, 0);

      return createBooking({
        barberId: selectedBarberId,
        serviceId: selectedServiceId,
        startTime: dateObj.toISOString(),
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
      resetForm();
    },
    onError: (err: Error) => {
      setErrorMessage(err.message === 'SLOT_ALREADY_BOOKED' ? t('reschedule.slot_booked') : t('reschedule.error'));
    },
  });

  const resetForm = () => {
    setStep(1);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setNotes('');
    setErrorMessage(null);
  };

  if (!isOpen) {
    return null;
  }

  const timeSlots = [
    '08:30', '09:15', '10:00', '10:45',
    '11:30', '12:15', '13:00', '13:45',
    '14:30', '15:15', '16:00', '16:45',
    '17:15',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 select-none">
      <div className="w-full max-w-xl bg-paper-100 border border-line rounded-sm flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper-50">
          <div>
            <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
              {t('appointment_modal.eyebrow')}
            </span>
            <h2 className="font-serif text-headline font-bold text-charcoal-900 mt-0.5">
              {t('appointment_modal.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-charcoal-500 hover:bg-paper-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-line bg-paper-200/50 flex items-center justify-between text-micro font-mono">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-charcoal-900 font-bold' : 'text-charcoal-500'}`}>
            <span>01</span>
            <span>{t('appointment_modal.step1')}</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-charcoal-900 font-bold' : 'text-charcoal-500'}`}>
            <span>02</span>
            <span>{t('appointment_modal.step2')}</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-charcoal-900 font-bold' : 'text-charcoal-500'}`}>
            <span>03</span>
            <span>{t('appointment_modal.step3')}</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-charcoal-900 font-bold' : 'text-charcoal-500'}`}>
            <span>04</span>
            <span>{t('appointment_modal.step4')}</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-none">
          {errorMessage && (
            <div className="mb-4 p-3 bg-status-cancelled-bg border border-status-cancelled-border text-status-cancelled-text text-label rounded-sm">
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-sm text-micro font-mono uppercase tracking-wider transition-colors shrink-0 ${
                      activeCategory === cat
                        ? 'bg-charcoal-900 text-paper-50 font-bold'
                        : 'bg-paper-50 border border-line text-charcoal-700 hover:bg-paper-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services
                  .filter((s) => (s.category ?? 'General') === activeCategory)
                  .map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-3.5 border rounded-sm cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-charcoal-900 bg-paper-200 ring-1 ring-charcoal-900'
                            : 'border-line bg-paper-50 hover:border-charcoal-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-serif font-semibold text-body text-charcoal-900">
                              {service.name}
                            </span>
                            <span className="font-serif font-bold text-body text-charcoal-900 shrink-0">
                              {service.price} zł
                            </span>
                          </div>
                          {service.description && (
                            <p className="text-[12px] text-charcoal-500 mt-1 line-clamp-2">
                              {getLocalizedServiceDescription(service, i18n.language)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-line text-micro font-mono text-charcoal-500">
                          <Clock className="w-3 h-3" />
                          <span>{service.durationMin} {t('booking.duration')}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarberId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`p-3.5 border rounded-sm cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-charcoal-900 bg-paper-200 ring-1 ring-charcoal-900'
                        : 'border-line bg-paper-50 hover:border-charcoal-700'
                    }`}
                  >
                    <img
                      src={
                        barber.avatarUrl ??
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={barber.name}
                      className="w-12 h-12 rounded-full object-cover border border-line-dark shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-serif text-headline font-semibold text-charcoal-900 block truncate">
                        {barber.name}
                      </span>
                      <span className="text-micro font-mono text-charcoal-500 block truncate mt-0.5">
                        {barber.specialization ?? 'Specialist'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-paper-50 border border-line rounded-sm text-label font-mono">
                <CalendarIcon className="w-4 h-4 text-terracotta" />
                <span>{t('appointment_modal.selected_date')} {currentDate.toISOString().split('T')[0]}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 border rounded-sm font-mono text-label transition-all ${
                        isSelected
                          ? 'border-charcoal-900 bg-charcoal-900 text-paper-50 font-bold'
                          : 'border-line bg-paper-50 hover:border-charcoal-700 text-charcoal-900'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-paper-50 border border-line rounded-sm space-y-1.5 text-label font-mono">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">{t('inspector.service')}:</span>
                  <span className="font-semibold text-charcoal-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">{t('inspector.master')}:</span>
                  <span className="font-semibold text-charcoal-900">{selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">{t('inspector.time_slot')}:</span>
                  <span className="font-semibold text-charcoal-900">{selectedTime}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-micro font-mono uppercase text-charcoal-500 block mb-1">
                    {t('appointment_modal.client_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="np. Aleksandra Wiśniewska"
                    className="w-full px-3 py-2 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-micro font-mono uppercase text-charcoal-500 block mb-1">
                      {t('appointment_modal.client_phone')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+48 512 000 000"
                      className="w-full px-3 py-2 bg-paper-50 border border-line rounded-sm text-body font-mono text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>

                  <div>
                    <label className="text-micro font-mono uppercase text-charcoal-500 block mb-1">
                      {t('appointment_modal.client_email')}
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 bg-paper-50 border border-line rounded-sm text-body font-mono text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-micro font-mono uppercase text-charcoal-500 block mb-1">
                    {t('appointment_modal.notes')}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('appointment_modal.notes_placeholder')}
                    className="w-full px-3 py-2 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-line bg-paper-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 border border-line bg-paper-100 text-charcoal-700 text-label rounded-sm hover:bg-paper-200 transition-colors"
            >
              {t('appointment_modal.back')}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-line bg-paper-100 text-charcoal-700 text-label rounded-sm hover:bg-paper-200 transition-colors"
            >
              {t('appointment_modal.cancel')}
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 bg-charcoal-900 text-paper-50 text-label font-medium rounded-sm hover:bg-charcoal-700 transition-colors"
            >
              {t('appointment_modal.next')}
            </button>
          ) : (
            <button
              disabled={createMutation.isPending || !clientName.trim() || !clientPhone.trim()}
              onClick={() => createMutation.mutate()}
              className="px-6 py-2 bg-charcoal-900 text-paper-50 text-label font-medium rounded-sm hover:bg-charcoal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{createMutation.isPending ? t('appointment_modal.booking') : t('appointment_modal.confirm')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
