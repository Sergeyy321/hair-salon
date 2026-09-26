import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useLogto } from '@logto/react';
import { LayoutDashboard, Calendar, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../../features/booking/bookingStore';
import { mockServices, mockStaff } from '../../features/timeline/mockData';
import { getLocalizedServiceDescription } from '../../features/timeline/serviceLocalization';
import { fetchServices, fetchBarbers, createBooking, type SyncedUser } from '../../lib/api';
import { StepperHeader } from './StepperHeader';
import { StepServices } from './steps/StepServices';
import { StepStaff } from './steps/StepStaff';
import { StepDateTime } from './steps/StepDateTime';
import { StepDetails } from './steps/StepDetails';
import { StepConfirmation } from './steps/StepConfirmation';
import { BookingSummaryDock } from './BookingSummaryDock';
import { MyBookingsModal } from './MyBookingsModal';
import type { Service, StaffMember } from '../../types/booking';

interface BookingLayoutProps {
  syncedUser?: SyncedUser | null;
}

export const BookingLayout: React.FC<BookingLayoutProps> = ({ syncedUser }) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { isAuthenticated, signIn, signOut } = useLogto();

  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    state,
    setStep,
    selectService,
    selectBarber,
    selectDate,
    selectTime,
    updateField,
    confirmBooking,
    resetBooking,
  } = useBookingStore();

  const { data: servicesApi } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const { data: barbersApi } = useQuery({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const services: Service[] =
    servicesApi && servicesApi.length > 0
      ? servicesApi.map((s) => ({
          id: s.id,
          name: s.name,
          durationMin: s.durationMin,
          price: typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0,
          category: s.category ?? 'Grooming',
          description: getLocalizedServiceDescription(s, i18n.language),
        }))
      : mockServices.map((s) => ({
          ...s,
          description: getLocalizedServiceDescription(s, i18n.language),
        }));

  const staffList: StaffMember[] =
    barbersApi && barbersApi.length > 0
      ? barbersApi.map((b) => ({
          id: b.id,
          name: b.name,
          email: b.email,
          role: b.role,
          specialization: b.specialization ?? 'Specialist',
          avatarUrl: b.avatarUrl ?? undefined,
        }))
      : mockStaff;

  const selectableStaff = useMemo(() => {
    return staffList.filter((m) => {
      if (syncedUser?.id && m.id === syncedUser.id) return false;
      if (syncedUser?.email && m.email && m.email.toLowerCase() === syncedUser.email.toLowerCase()) return false;
      return true;
    });
  }, [staffList, syncedUser]);

  const selectableBarbers = useMemo(() => {
    return (barbersApi ?? []).filter((b) => {
      if (syncedUser?.id && b.id === syncedUser.id) return false;
      if (syncedUser?.email && b.email.toLowerCase() === syncedUser.email.toLowerCase()) return false;
      return true;
    });
  }, [barbersApi, syncedUser]);

  const selectedService = services.find((s) => s.id === state.selectedServiceId);
  const selectedStaff = selectableStaff.find((m) => m.id === state.selectedBarberId);
  const isAnyStaff = state.selectedBarberId === 'ANY';

  useEffect(() => {
    if (syncedUser) {
      if (!state.clientName && syncedUser.name) {
        updateField('clientName', syncedUser.name);
      }
      if (!state.clientEmail && syncedUser.email) {
        updateField('clientEmail', syncedUser.email);
      }
    }
  }, [syncedUser, state.clientName, state.clientEmail, updateField]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const parts = (state.selectedTime ?? '10:00').split(':');
      const hours = Number(parts[0]) || 10;
      const minutes = Number(parts[1]) || 0;
      const [y, m, d] = state.selectedDate.split('-').map(Number);
      const dateObj = new Date(y || 2026, (m || 1) - 1, d || 1, hours, minutes, 0, 0);

      const targetBarberId = state.selectedBarberId || 'ANY';

      return createBooking({
        barberId: targetBarberId,
        serviceId: state.selectedServiceId ?? services[0]?.id ?? 'srv-1',
        startTime: dateObj.toISOString(),
        clientId: syncedUser?.id,
        clientName: state.clientName.trim(),
        clientPhone: state.clientPhone.trim(),
        clientEmail: state.clientEmail.trim() || undefined,
        notes: state.notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (syncedUser?.logtoSub) {
        void queryClient.invalidateQueries({ queryKey: ['my-bookings', syncedUser.logtoSub] });
      }
      confirmBooking();
    },
    onError: (err: Error) => {
      if (err.message === 'CANNOT_BOOK_SELF') {
        setBookingError(
          i18n.language.startsWith('pl')
            ? 'Personel salonu nie może dokonywać rezerwacji u samego siebie.'
            : 'Salon staff cannot book an appointment with themselves.'
        );
      } else if (err.message === 'SLOT_ALREADY_BOOKED' || err.message === 'NO_BARBERS_AVAILABLE') {
        setBookingError(
          i18n.language.startsWith('pl')
            ? 'Wybrany termin jest już zajęty. Proszę wybrać inny termin lub specjalistę.'
            : 'The selected slot is already booked. Please choose another time or specialist.'
        );
      } else {
        setBookingError(
          i18n.language.startsWith('pl')
            ? 'Nie udało się utworzyć rezerwacji. Sprawdź dane i spróbuj ponownie.'
            : 'Failed to create booking. Please check details and try again.'
        );
      }
    },
  });

  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return Boolean(state.selectedServiceId);
      case 2:
        return Boolean(
          state.selectedBarberId &&
          (state.selectedBarberId === 'ANY' ||
            selectableStaff.some((s) => s.id === state.selectedBarberId))
        );
      case 3:
        return Boolean(state.selectedDate && state.selectedTime);
      case 4:
        return (
          state.clientName.trim().length >= 2 &&
          state.clientPhone.trim().length >= 7 &&
          state.clientEmail.includes('@')
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (state.currentStep === 4) {
      setBookingError(null);
      createMutation.mutate();
    } else {
      setStep(state.currentStep + 1);
    }
  };

  const handleBack = () => {
    setStep(state.currentStep - 1);
  };

  const changeLanguage = (lng: 'pl' | 'en') => {
    void i18n.changeLanguage(lng);
  };

  const handleClientSignIn = () => {
    sessionStorage.setItem('lume_post_login_redirect', '/book');
    void signIn(`${window.location.origin}/callback`);
  };

  const handleClientSignOut = () => {
    void signOut(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col justify-between text-charcoal-700 font-sans antialiased">
      <div>
        <header className="border-b border-line bg-paper-50 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-charcoal-900 flex items-center justify-center">
                <span className="font-serif text-lg font-bold text-charcoal-900">L</span>
              </div>
              <div>
                <h1 className="font-serif text-headline font-bold text-charcoal-900 tracking-tight leading-none">
                  {t('app.brand')}
                </h1>
                <span className="text-[10px] font-mono tracking-widest text-charcoal-500 uppercase">
                  {t('app.tagline')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex border border-line bg-paper-100 p-0.5 rounded-sm text-micro font-mono">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-0.5 rounded-sm transition-colors ${
                    i18n.language.startsWith('en')
                      ? 'bg-charcoal-900 text-paper-50 font-semibold'
                      : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('pl')}
                  className={`px-2 py-0.5 rounded-sm transition-colors ${
                    i18n.language.startsWith('pl')
                      ? 'bg-charcoal-900 text-paper-50 font-semibold'
                      : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  PL
                </button>
              </div>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsMyBookingsOpen(true)}
                    className="px-2.5 py-1.5 border border-line bg-paper-100 hover:bg-paper-200 text-charcoal-800 rounded-sm text-micro font-mono transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-charcoal-600" />
                    <span>{t('my_bookings.title')}</span>
                  </button>

                  <Link
                    to="/admin"
                    className="px-2.5 py-1.5 border border-line bg-paper-100 hover:bg-paper-200 rounded-sm text-micro font-mono text-charcoal-700 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-charcoal-500" />
                    <span className="hidden sm:inline">
                      {syncedUser?.role === 'CLIENT' ? t('header.for_staff') : t('nav.admin_view')}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5 px-2 py-1 bg-paper-100 border border-line rounded-sm">
                    {syncedUser?.avatarUrl ? (
                      <img
                        src={syncedUser.avatarUrl}
                        alt={syncedUser.name ?? 'Client'}
                        className="w-5 h-5 rounded-full object-cover border border-line"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-charcoal-900 text-paper-50 text-[10px] font-mono flex items-center justify-center font-bold">
                        {(syncedUser?.name || syncedUser?.email || 'U')[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-micro font-mono text-charcoal-800 max-w-[110px] truncate hidden sm:inline">
                      {syncedUser?.name || syncedUser?.email}
                    </span>
                  </div>

                  <button
                    onClick={handleClientSignOut}
                    className="p-1.5 border border-line bg-paper-100 hover:bg-paper-200 text-charcoal-500 hover:text-charcoal-900 rounded-sm transition-colors"
                    title={t('auth.signout')}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClientSignIn}
                    className="px-3 py-1.5 bg-charcoal-900 text-paper-50 hover:bg-charcoal-700 rounded-sm text-micro font-medium transition-colors flex items-center gap-1.5 shadow-none"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('header.signin_client')}</span>
                  </button>

                  <Link
                    to="/admin"
                    className="px-2.5 py-1.5 border border-line bg-paper-100 hover:bg-paper-200 rounded-sm text-micro font-mono text-charcoal-700 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-charcoal-500" />
                    <span className="hidden sm:inline">{t('header.for_staff')}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <StepperHeader currentStep={state.currentStep} onStepClick={setStep} />

        <main className="max-w-2xl mx-auto px-4 py-8">
          {bookingError && state.currentStep === 4 && (
            <div className="mb-6 p-3 bg-status-cancelled-bg border border-status-cancelled-border text-status-cancelled-text text-label rounded-sm flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {state.currentStep === 1 && (
            <StepServices
              services={services}
              selectedServiceId={state.selectedServiceId}
              onSelectService={selectService}
            />
          )}

          {state.currentStep === 2 && (
            <StepStaff
              staffList={selectableStaff}
              selectedBarberId={state.selectedBarberId}
              onSelectBarber={selectBarber}
              currentUserId={syncedUser?.id}
              currentUserEmail={syncedUser?.email}
            />
          )}

          {state.currentStep === 3 && (
            <StepDateTime
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              onSelectDate={selectDate}
              onSelectTime={selectTime}
              selectedBarberId={state.selectedBarberId}
              selectedServiceDurationMin={selectedService?.durationMin ?? 60}
              barbers={selectableBarbers}
            />
          )}

          {state.currentStep === 4 && (
            <StepDetails
              name={state.clientName}
              phone={state.clientPhone}
              email={state.clientEmail}
              notes={state.notes}
              onChange={(field, val) => updateField(field, val)}
            />
          )}

          {state.currentStep === 5 && (
            <StepConfirmation
              service={selectedService}
              staff={selectedStaff}
              isAnyStaff={isAnyStaff}
              date={state.selectedDate}
              time={state.selectedTime}
              clientName={state.clientName}
              onReset={resetBooking}
            />
          )}
        </main>
      </div>

      <BookingSummaryDock
        currentStep={state.currentStep}
        service={selectedService}
        staff={selectedStaff}
        isAnyStaff={isAnyStaff}
        selectedDate={state.selectedDate}
        selectedTime={state.selectedTime}
        canProceed={canProceed()}
        isSubmitting={createMutation.isPending}
        onNext={handleNext}
        onBack={handleBack}
      />

      {isAuthenticated && (
        <MyBookingsModal
          isOpen={isMyBookingsOpen}
          onClose={() => setIsMyBookingsOpen(false)}
          userSub={syncedUser?.logtoSub || ''}
          userName={syncedUser?.name}
        />
      )}
    </div>
  );
};
