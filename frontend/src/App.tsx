import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLogto } from '@logto/react';
import { Search, ChevronLeft, ChevronRight, Plus, LogIn, Sparkles } from 'lucide-react';
import { Callback } from './components/auth/Callback';
import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';
import { HeaderProfile } from './components/dashboard/HeaderProfile';
import { SidebarNav, type NavTab } from './components/dashboard/SidebarNav';
import { MetricsCards } from './components/dashboard/MetricsCards';
import { TimelineGrid } from './components/dashboard/timeline/TimelineGrid';
import { BookingInspector } from './components/dashboard/inspector/BookingInspector';
import { AddAppointmentModal } from './components/dashboard/AddAppointmentModal';
import { RescheduleModal } from './components/dashboard/RescheduleModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { ClientsView } from './components/dashboard/ClientsView';
import { ServicesView } from './components/dashboard/ServicesView';
import { AppointmentsView } from './components/dashboard/AppointmentsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { BookingLayout } from './components/booking/BookingLayout';
import { ClientPortalView } from './components/client/ClientPortalView';
import {
  fetchBarbers,
  fetchServices,
  fetchBookings,
  cancelBooking,
  updateBookingStatus,
  syncUserWithBackend,
  type BarberApi,
  type ServiceApi,
  type BookingApi,
  type SyncedUser,
} from './lib/api';

const defaultBarbers: BarberApi[] = [
  {
    id: 'st-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@lume.salon',
    role: 'BARBER',
    specialization: 'Senior Colorist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-2',
    name: 'Marta Kowalska',
    email: 'marta.kowalska@lume.salon',
    role: 'BARBER',
    specialization: 'Hair Stylist & Cut',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-3',
    name: 'Piotr Zieliński',
    email: 'piotr.zielinski@lume.salon',
    role: 'BARBER',
    specialization: 'Master Barber',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-4',
    name: 'Julia Nowak',
    email: 'julia.nowak@lume.salon',
    role: 'BARBER',
    specialization: 'Scalp & Rituals',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

const defaultServices: ServiceApi[] = [
  {
    id: 'srv-1',
    name: 'Balayage & Modelowanie',
    durationMin: 150,
    price: 380,
    category: 'Coloring',
    description: 'Multi-dimensional brush lightening with toning & blowout finish.',
  },
  {
    id: 'srv-2',
    name: 'Strzyżenie Autorskie Damskie',
    durationMin: 60,
    price: 190,
    category: 'Cut & Style',
    description: 'Signature tailored haircut crafted to face architecture and natural texture.',
  },
  {
    id: 'srv-3',
    name: 'Strzyżenie Męskie & Brody',
    durationMin: 50,
    price: 140,
    category: 'Barbering',
    description: 'Classic shear work, straight razor contours, and nourishing argan oil grooming.',
  },
  {
    id: 'srv-4',
    name: 'Rytuał Odbudowy Keratynowej',
    durationMin: 75,
    price: 240,
    category: 'Care Rituals',
    description: 'Intense keratin reconstructive treatment with steam hydration.',
  },
];

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
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingApi | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingApi | null>(null);

  const dateIsoString = currentDate.toISOString().split('T')[0] ?? '';

  const { data: barbersData } = useQuery<BarberApi[]>({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const { data: servicesData } = useQuery<ServiceApi[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const { data: bookingsData = [] } = useQuery<BookingApi[]>({
    queryKey: ['bookings', dateIsoString],
    queryFn: () => fetchBookings(dateIsoString),
    staleTime: 120000,
    placeholderData: keepPreviousData,
  });

  const barbers = barbersData && barbersData.length > 0 ? barbersData : defaultBarbers;
  const services = servicesData && servicesData.length > 0 ? servicesData : defaultServices;
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingToCancel(null);
      if (selectedBookingId === bookingToCancel?.id) {
        setSelectedBookingId(null);
      }
    },
  });

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
      cancelMutation.mutate(bookingToCancel.id);
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

const getCachedUser = (): SyncedUser | null => {
  try {
    const raw = sessionStorage.getItem('lume_synced_user');
    return raw ? (JSON.parse(raw) as SyncedUser) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [syncedUser, setSyncedUser] = useState<SyncedUser | null>(getCachedUser);
  const [isSyncing, setIsSyncing] = useState(true);

  const updateSyncedUser = (user: SyncedUser | null) => {
    setSyncedUser(user);
    try {
      if (user) {
        sessionStorage.setItem('lume_synced_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('lume_synced_user');
      }
    } catch {}
  };

  const { isAuthenticated, getIdTokenClaims, fetchUserInfo } = useLogto();

  const { data: barbersData } = useQuery<BarberApi[]>({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const { data: servicesData } = useQuery<ServiceApi[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const barbers = barbersData && barbersData.length > 0 ? barbersData : defaultBarbers;
  const services = servicesData && servicesData.length > 0 ? servicesData : defaultServices;

  const getIdTokenClaimsRef = useRef(getIdTokenClaims);
  const fetchUserInfoRef = useRef(fetchUserInfo);

  useEffect(() => {
    getIdTokenClaimsRef.current = getIdTokenClaims;
    fetchUserInfoRef.current = fetchUserInfo;
  });

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          updateSyncedUser(null);
          setIsSyncing(false);
        }
      });
      return;
    }

    const resolveUserData = async () => {
      setIsSyncing(true);
      try {
        const claims = await getIdTokenClaimsRef.current();
        const sub = claims?.sub;

        if (isCancelled) return;

        if (!sub) {
          const info = await fetchUserInfoRef.current();
          if (!info?.sub) {
            if (!isCancelled) setIsSyncing(false);
            return;
          }
          if (isCancelled) return;
          const res = await syncUserWithBackend({
            logtoSub: info.sub,
            email: info.email ?? undefined,
            name: info.name ?? undefined,
            picture: info.picture ?? undefined,
          });
          if (!isCancelled) {
            updateSyncedUser(res.user);
          }
          return;
        }

        const res = await syncUserWithBackend({
          logtoSub: sub,
          email: claims.email ?? undefined,
          name: claims.name ?? undefined,
          picture: claims.picture ?? undefined,
        });

        if (!isCancelled) {
          updateSyncedUser(res.user);
        }
      } catch {
        if (!isCancelled) {
          try {
            const claims = await getIdTokenClaimsRef.current();
            if (claims?.sub) {
              const isDirector = claims.email?.toLowerCase() === 'borawiy457@kingdais.com';
              const fallbackRole = isDirector ? 'SALON_DIRECTOR' : 'CLIENT';
              updateSyncedUser({
                id: claims.sub,
                logtoSub: claims.sub,
                email: claims.email || `${claims.sub}@client.local`,
                name: claims.name ?? (fallbackRole === 'SALON_DIRECTOR' ? 'Sarah Mitchell' : 'Lumé Client'),
                role: fallbackRole,
                avatarUrl: claims.picture ?? undefined,
              });
            }
          } catch {
            updateSyncedUser(null);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    };

    void resolveUserData();

    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setIsSyncing(false);
      }
    }, 3500);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  const handleRoleSwitch = (newRole: 'SALON_DIRECTOR' | 'CLIENT') => {
    if (!syncedUser) return;
    syncUserWithBackend({
      logtoSub: syncedUser.logtoSub,
      email: syncedUser.email,
      name: syncedUser.name ?? undefined,
      picture: syncedUser.avatarUrl ?? undefined,
      role: newRole,
    })
      .then((res) => {
        updateSyncedUser(res.user);
      })
      .catch(() => {
        updateSyncedUser({ ...syncedUser, role: newRole });
      });
  };

  return (
    <Routes>
      <Route path="/" element={<BookingLayout syncedUser={syncedUser} />} />
      <Route path="/book" element={<BookingLayout syncedUser={syncedUser} />} />
      <Route path="/callback" element={<Callback />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute
            syncedUser={syncedUser}
            isSyncing={isSyncing}
            onRoleSwitch={handleRoleSwitch}
          >
            <Dashboard
              syncedUser={syncedUser}
              onRoleSwitch={handleRoleSwitch}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/portal"
        element={
          isAuthenticated && syncedUser ? (
            <ClientPortalView
              user={syncedUser}
              barbers={barbers}
              services={services}
              onRoleSwitch={handleRoleSwitch}
            />
          ) : (
            <BookingLayout syncedUser={syncedUser} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
