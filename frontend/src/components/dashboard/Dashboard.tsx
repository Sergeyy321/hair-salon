import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogto } from '@logto/react';
import { Search, ChevronLeft, ChevronRight, Plus, LogIn, Sparkles } from 'lucide-react';
import { HeaderProfile } from './HeaderProfile';
import { SidebarNav, type NavTab } from './SidebarNav';
import { MetricsCards } from './MetricsCards';
import { TimelineGrid } from './timeline/TimelineGrid';
import { BookingInspector } from './inspector/BookingInspector';
import { AddAppointmentModal, RescheduleModal, ConfirmDialog } from '../modals';
import { ClientsView } from './ClientsView';
import { ServicesView } from './ServicesView';
import { AppointmentsView } from './AppointmentsView';
import { SettingsView } from './SettingsView';
import { useBarbers, useServices, useSalonBookings, useBookingMutations } from '../../features/dashboard/useSalonData';
import type { BookingApi, SyncedUser } from '../../lib/api';

interface DashboardProps {
  syncedUser?: SyncedUser | null;
  onRoleSwitch?: (newRole: 'SALON_DIRECTOR' | 'CLIENT') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  syncedUser,
  onRoleSwitch,
}) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, signIn } = useLogto();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingApi | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingApi | null>(null);

  const dateIsoString = currentDate.toISOString().split('T')[0] ?? '';

  const { barbers } = useBarbers();
  const { services } = useServices();
  const { data: bookingsData = [] } = useSalonBookings(dateIsoString);
  const { statusMutation, cancelMutation } = useBookingMutations();

  const visibleBookings = bookingsData.filter((b) => b.status !== 'CANCELLED');

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return visibleBookings;
    }
    const q = searchQuery.toLowerCase();
    return visibleBookings.filter(
      (b) =>
        (b.client.name?.toLowerCase().includes(q) ?? false) ||
        b.client.email.toLowerCase().includes(q) ||
        b.service.name.toLowerCase().includes(q) ||
        (b.barber.name?.toLowerCase().includes(q) ?? false)
    );
  }, [visibleBookings, searchQuery]);

  const selectedBooking = useMemo(() => {
    if (selectedBookingId) {
      return visibleBookings.find((b) => b.id === selectedBookingId) ?? null;
    }
    return visibleBookings[0] ?? null;
  }, [visibleBookings, selectedBookingId]);

  const handleUpdateStatus = (id: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED') => {
    statusMutation.mutate({ id, status });
  };

  const handleOpenReschedule = (booking: BookingApi) => {
    setRescheduleTarget(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleRequestCancel = (booking: BookingApi) => {
    setBookingToCancel(booking);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelMutation.mutate(bookingToCancel.id, {
        onSuccess: () => {
          setBookingToCancel(null);
          if (selectedBookingId === bookingToCancel?.id) {
            setSelectedBookingId(null);
          }
        },
      });
    }
  };

  const confirmedBookings = visibleBookings.filter((b) => b.status === 'CONFIRMED');
  const totalMinutesBooked = confirmedBookings.reduce((acc, b) => acc + b.service.durationMin, 0);
  const totalAvailableMinutes = Math.max(1, barbers.length * 10 * 60);
  const occupancyPercent = Math.min(
    100,
    Math.round((totalMinutesBooked / totalAvailableMinutes) * 100)
  );

  const totalRevenue = confirmedBookings.reduce((acc, b) => {
    const val = typeof b.service.price === 'number' ? b.service.price : parseFloat(b.service.price) || 0;
    return acc + val;
  }, 0);

  const formattedDate = new Intl.DateTimeFormat(
    i18n.language.startsWith('pl') ? 'pl-PL' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' }
  ).format(currentDate);

  const shiftDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const handleSignIn = () => {
    sessionStorage.setItem('lume_post_login_redirect', '/admin');
    void signIn(`${window.location.origin}/callback`);
  };

  return (
    <div className="h-screen w-full bg-paper-100 text-charcoal-700 font-sans antialiased overflow-hidden flex select-none">
      <SidebarNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-paper-100 border-b border-line px-6 flex items-center justify-between gap-6 select-none shrink-0">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-paper-50 border border-line rounded-sm text-body text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-charcoal-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-charcoal-900 text-paper-50 hover:bg-charcoal-700 transition-colors text-label font-medium rounded-sm flex items-center gap-1.5 shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>{t('header.add_appointment')}</span>
            </button>

            <div className="h-5 w-[1px] bg-line" />

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => shiftDate(-1)}
                className="w-8 h-8 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={setToday}
                className="px-3 h-8 text-label border border-line bg-paper-50 text-charcoal-900 rounded-sm font-medium hover:bg-paper-200 transition-colors font-mono"
              >
                {formattedDate}
              </button>
              <button
                onClick={() => shiftDate(1)}
                className="w-8 h-8 flex items-center justify-center border border-line bg-paper-50 hover:bg-paper-200 rounded-sm text-charcoal-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-[1px] bg-line" />

            <HeaderProfile syncedUser={syncedUser} onRoleSwitch={onRoleSwitch} />
          </div>
        </header>

        {!isAuthenticated && (
          <div className="px-6 py-2.5 bg-paper-200 border-b border-line flex items-center justify-between text-label font-sans">
            <div className="flex items-center gap-2 text-charcoal-800">
              <Sparkles className="w-4 h-4 text-terracotta-500 shrink-0" />
              <span>{t('header.guest_notice')}</span>
            </div>
            <button
              onClick={handleSignIn}
              className="px-3 py-1 bg-charcoal-900 text-paper-50 rounded-sm text-micro font-medium hover:bg-charcoal-700 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3 h-3" />
              <span>{t('header.signin_staff')}</span>
            </button>
          </div>
        )}

        {currentTab === 'clients' ? (
          <ClientsView />
        ) : currentTab === 'services' ? (
          <ServicesView />
        ) : currentTab === 'settings' ? (
          <SettingsView />
        ) : currentTab === 'appointments' ? (
          <AppointmentsView
            bookings={visibleBookings}
            onOpenReschedule={handleOpenReschedule}
            onRequestCancel={handleRequestCancel}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <MetricsCards
              totalBookings={visibleBookings.length}
              occupancyPercent={occupancyPercent}
              projectedRevenue={`${totalRevenue.toLocaleString()} zł`}
              newClientsCount={4}
            />

            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div className="flex-1 h-full overflow-hidden">
                <TimelineGrid
                  barbers={barbers}
                  bookings={filteredBookings}
                  selectedBookingId={selectedBooking?.id ?? null}
                  onSelectBooking={(b) => setSelectedBookingId(b.id)}
                />
              </div>

              <BookingInspector
                booking={selectedBooking}
                onUpdateStatus={handleUpdateStatus}
                onOpenReschedule={handleOpenReschedule}
                onRequestCancel={handleRequestCancel}
              />
            </div>
          </div>
        )}
      </div>

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        barbers={barbers}
        services={services}
        currentDate={currentDate}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setRescheduleTarget(null);
        }}
        booking={rescheduleTarget}
      />

      <ConfirmDialog
        isOpen={bookingToCancel !== null}
        title={t('confirm.cancel_title')}
        message={
          i18n.language.startsWith('pl')
            ? `Czy na pewno chcesz odwołać wizytę klienta ${bookingToCancel?.client.name || bookingToCancel?.client.email || 'Klient'}?`
            : `Are you sure you want to cancel the appointment for ${bookingToCancel?.client.name || bookingToCancel?.client.email || 'Client'}?`
        }
        confirmLabel={t('confirm.cancel_confirm')}
        cancelLabel={t('confirm.cancel_keep')}
        isDestructive={true}
        isLoading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
};
