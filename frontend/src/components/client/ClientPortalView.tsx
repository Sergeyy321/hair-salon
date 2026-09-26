import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLogto } from '@logto/react';
import {
  Calendar,
  Clock,
  Scissors,
  Plus,
  X,
  CalendarClock,
  LogOut,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import {
  fetchMyBookings,
  cancelBooking,
  type BookingApi,
  type SyncedUser,
  type BarberApi,
  type ServiceApi,
} from '../../lib/api';
import { AddAppointmentModal } from '../dashboard/AddAppointmentModal';
import { RescheduleModal } from '../dashboard/RescheduleModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ServicesView } from '../dashboard/ServicesView';
import { SettingsView } from '../dashboard/SettingsView';

interface ClientPortalViewProps {
  user: SyncedUser;
  barbers: BarberApi[];
  services: ServiceApi[];
  onRoleSwitch?: (newRole: 'SALON_DIRECTOR' | 'CLIENT') => void;
}

type ClientTab = 'my_bookings' | 'book_now' | 'services' | 'settings';

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  user,
  barbers,
  services,
  onRoleSwitch,
}) => {
  const { t, i18n } = useTranslation();
  const { signOut } = useLogto();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ClientTab>('my_bookings');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingApi | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingApi | null>(null);

  const { data: myBookings = [], isLoading } = useQuery<BookingApi[]>({
    queryKey: ['my_bookings', user.logtoSub],
    queryFn: () => fetchMyBookings(user.logtoSub),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my_bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingToCancel(null);
    },
  });

  const handleSignOut = () => {
    void signOut(window.location.origin);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelMutation.mutate(bookingToCancel.id);
    }
  };

  const handleOpenReschedule = (booking: BookingApi) => {
    setRescheduleTarget(booking);
    setIsRescheduleOpen(true);
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const datePart = d.toLocaleDateString(i18n.language.startsWith('pl') ? 'pl-PL' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const timePart = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return `${datePart} o ${timePart}`;
    } catch {
      return iso;
    }
  };

  const activeBookings = myBookings.filter((b) => b.status !== 'CANCELLED');
  const pastBookings = myBookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col font-sans antialiased text-charcoal-700 select-none">
      <header className="h-16 bg-paper-50 border-b border-line px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-charcoal-900 bg-paper-100 flex items-center justify-center">
            <span className="font-serif text-lg font-bold text-charcoal-900">L</span>
          </div>
          <div>
            <span className="font-serif text-headline font-bold text-charcoal-900 tracking-tight leading-none block">
              {t('app.brand')}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-charcoal-500 uppercase mt-0.5 block">
              Client Space
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1 border border-line bg-paper-100 p-0.5 rounded-sm">
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-3 py-1.5 text-label font-mono rounded-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'my_bookings'
                ? 'bg-charcoal-900 text-paper-50 font-medium'
                : 'text-charcoal-700 hover:text-charcoal-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{i18n.language.startsWith('pl') ? 'Moje wizyty' : 'My Bookings'}</span>
            {activeBookings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-terracotta text-paper-50 rounded-sm">
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-label font-mono rounded-sm transition-colors flex items-center gap-1.5 bg-paper-50 text-charcoal-900 hover:bg-paper-200 border border-line"
          >
            <Plus className="w-3.5 h-3.5 text-terracotta-500" />
            <span>{i18n.language.startsWith('pl') ? 'Umów wizytę' : 'Book Visit'}</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 text-label font-mono rounded-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-charcoal-900 text-paper-50 font-medium'
                : 'text-charcoal-700 hover:text-charcoal-900'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{i18n.language.startsWith('pl') ? 'Cennik & Usługi' : 'Services'}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-label font-mono rounded-sm transition-colors ${
              activeTab === 'settings'
                ? 'bg-charcoal-900 text-paper-50 font-medium'
                : 'text-charcoal-700 hover:text-charcoal-900'
            }`}
          >
            <span>{i18n.language.startsWith('pl') ? 'Ustawienia' : 'Settings'}</span>
          </button>

          <Link
            to="/admin"
            className="px-3 py-1.5 text-label font-mono rounded-sm transition-colors flex items-center gap-1.5 text-charcoal-700 hover:text-charcoal-900 border border-line bg-paper-100 hover:bg-paper-200"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-charcoal-500" />
            <span>{i18n.language.startsWith('pl') ? 'Panel salonu' : 'Salon Dashboard'}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {onRoleSwitch && (
            <button
              onClick={() => onRoleSwitch('SALON_DIRECTOR')}
              className="px-2.5 py-1 border border-line bg-paper-200 hover:bg-paper-300 rounded-sm text-micro font-mono text-charcoal-700 flex items-center gap-1.5 transition-colors"
              title="Switch role for testing"
            >
              <ShieldCheck className="w-3 h-3 text-terracotta-500" />
              <span>Role: Client (Switch)</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-2 py-1 bg-paper-100 border border-line rounded-sm">
            <img
              src={
                user.avatarUrl ??
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
              }
              alt={user.name ?? 'Client'}
              className="w-7 h-7 rounded-full object-cover border border-line-dark"
            />
            <div className="text-left font-mono leading-none">
              <span className="text-label font-semibold text-charcoal-900 block truncate max-w-[120px]">
                {user.name || 'Client'}
              </span>
              <span className="text-[10px] text-charcoal-500 block truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-8 h-8 rounded-sm border border-line bg-paper-100 hover:bg-paper-300 flex items-center justify-center text-charcoal-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {activeTab === 'services' ? (
        <ServicesView />
      ) : activeTab === 'settings' ? (
        <SettingsView />
      ) : (
        <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-line pb-6">
            <div>
              <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
                ATELIER PROFILE
              </span>
              <h1 className="font-serif text-display font-bold text-charcoal-900 mt-1">
                {i18n.language.startsWith('pl')
                  ? `Witaj, ${user.name?.split(' ')[0] ?? 'w Lumé'}`
                  : `Welcome, ${user.name?.split(' ')[0] ?? 'to Lumé'}`}
              </h1>
              <p className="text-body text-charcoal-500 mt-1">
                {i18n.language.startsWith('pl')
                  ? 'Zarządzaj swoimi nadchodzącymi zabiegami w atelier Lumé.'
                  : 'Manage your scheduled luxury treatments at Lumé atelier.'}
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{i18n.language.startsWith('pl') ? 'Umów nową wizytę' : 'Book New Treatment'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-headline font-bold text-charcoal-900">
                {i18n.language.startsWith('pl') ? 'Nadchodzące wizyty' : 'Upcoming Appointments'}
              </h2>
              <span className="text-micro font-mono text-charcoal-500">
                {activeBookings.length} {i18n.language.startsWith('pl') ? 'aktywnych' : 'active'}
              </span>
            </div>

            {isLoading ? (
              <div className="h-40 border border-line rounded-sm bg-paper-50 flex items-center justify-center text-charcoal-500 font-mono text-label">
                Loading your appointments...
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="p-8 border border-dashed border-line rounded-sm bg-paper-50 text-center space-y-3">
                <div className="w-12 h-12 rounded-sm border border-line bg-paper-100 flex items-center justify-center mx-auto text-charcoal-400">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-headline font-bold text-charcoal-900">
                  {i18n.language.startsWith('pl') ? 'Brak zaplanowanych wizyt' : 'No Upcoming Appointments'}
                </h3>
                <p className="text-body text-charcoal-500 max-w-sm mx-auto">
                  {i18n.language.startsWith('pl')
                    ? 'Nie masz jeszcze żadnych rezerwacji. Wybierz dogodny termin i stylistę, aby zarezerwować zabieg.'
                    : 'You currently have no scheduled appointments. Select a specialist and time to book your visit.'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 border border-charcoal-900 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-terracotta-500" />
                  <span>{i18n.language.startsWith('pl') ? 'Wybierz zabieg' : 'Select Treatment'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 border border-line rounded-sm bg-paper-50 flex items-center justify-between gap-4 hover:border-charcoal-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          booking.barber.avatarUrl ??
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={booking.barber.name ?? 'Stylist'}
                        className="w-12 h-12 rounded-full object-cover border border-line-dark shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-charcoal-900 text-headline">
                            {booking.service.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-micro font-mono uppercase rounded-sm border ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-status-confirmed-bg text-status-confirmed-text border-status-confirmed-border'
                                : 'bg-status-pending-bg text-status-pending-text border-status-pending-border'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-label font-mono text-charcoal-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                            <span>{formatDateTime(booking.startTime)}</span>
                          </div>
                          <span>•</span>
                          <span>Stylist: {booking.barber.name}</span>
                          <span>•</span>
                          <span className="font-semibold text-charcoal-900">{booking.service.price} zł</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReschedule(booking)}
                        className="px-3 py-1.5 border border-line bg-paper-100 hover:bg-paper-300 text-charcoal-800 rounded-sm text-label font-mono transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                        <span>{i18n.language.startsWith('pl') ? 'Przełóż' : 'Reschedule'}</span>
                      </button>

                      <button
                        onClick={() => setBookingToCancel(booking)}
                        className="px-3 py-1.5 border border-status-cancelled-border bg-status-cancelled-bg hover:bg-red-100 text-status-cancelled-text rounded-sm text-label font-mono transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{i18n.language.startsWith('pl') ? 'Odwołaj' : 'Cancel'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pastBookings.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-line">
              <h2 className="font-serif text-headline font-bold text-charcoal-500">
                {i18n.language.startsWith('pl') ? 'Historia / Anulowane' : 'Cancelled History'}
              </h2>
              <div className="space-y-2 opacity-60">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border border-line rounded-sm bg-paper-100 flex items-center justify-between text-label font-mono"
                  >
                    <div>
                      <span className="line-through text-charcoal-700 font-semibold mr-3">
                        {booking.service.name}
                      </span>
                      <span className="text-charcoal-500">{formatDateTime(booking.startTime)}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-paper-200 text-charcoal-500 border border-line rounded-sm text-micro">
                      CANCELLED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        barbers={barbers}
        services={services}
        currentDate={new Date()}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleTarget(null);
        }}
        booking={rescheduleTarget}
      />

      <ConfirmDialog
        isOpen={bookingToCancel !== null}
        title={i18n.language.startsWith('pl') ? 'Odwołaj wizytę' : 'Cancel Appointment'}
        message={
          i18n.language.startsWith('pl')
            ? `Czy na pewno chcesz odwołać wizytę na zabieg «${bookingToCancel?.service.name}»?`
            : `Are you sure you want to cancel your appointment for «${bookingToCancel?.service.name}»?`
        }
        confirmLabel={i18n.language.startsWith('pl') ? 'Odwołaj wizytę' : 'Cancel Appointment'}
        cancelLabel={i18n.language.startsWith('pl') ? 'Wróć' : 'Keep'}
        isDestructive={true}
        isLoading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
};
