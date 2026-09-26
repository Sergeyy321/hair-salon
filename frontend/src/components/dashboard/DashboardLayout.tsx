import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarNav, type NavTab } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { MetricsCards } from './MetricsCards';
import { TimelineGrid } from './timeline/TimelineGrid';
import { BookingInspector } from './inspector/BookingInspector';
import { AddAppointmentModal } from './AddAppointmentModal';
import { RescheduleModal } from './RescheduleModal';
import {
  fetchBarbers,
  fetchBookings,
  fetchServices,
  updateBookingStatus,
  type BookingApi,
  type BarberApi,
  type ServiceApi,
} from '../../lib/api';

interface DashboardLayoutProps {
  onViewChange: (view: 'admin' | 'client') => void;
}

const fallbackBarbers: BarberApi[] = [
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

const fallbackBookings: BookingApi[] = [
  {
    id: 'bk-101',
    barberId: 'st-1',
    clientId: 'cl-1',
    serviceId: 'srv-1',
    startTime: '2026-09-25T09:30:00.000Z',
    endTime: '2026-09-25T12:00:00.000Z',
    status: 'CONFIRMED',
    notes: 'Wrażliwa skóra głowy. Używać produktów bez amoniaku.',
    createdAt: '2026-09-25T08:00:00.000Z',
    service: {
      id: 'srv-1',
      name: 'Balayage & Modelowanie',
      durationMin: 150,
      price: 380,
    },
    barber: {
      id: 'st-1',
      name: 'Elena Rostova',
      specialization: 'Senior Colorist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    client: {
      id: 'cl-1',
      name: 'Aleksandra Wiśniewska',
      email: 'aleksandra.w@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'bk-102',
    barberId: 'st-2',
    clientId: 'cl-2',
    serviceId: 'srv-2',
    startTime: '2026-09-25T13:00:00.000Z',
    endTime: '2026-09-25T14:00:00.000Z',
    status: 'CONFIRMED',
    notes: 'Lekkie cieniowanie końcówek.',
    createdAt: '2026-09-25T08:00:00.000Z',
    service: {
      id: 'srv-2',
      name: 'Strzyżenie Autorskie Damskie',
      durationMin: 60,
      price: 190,
    },
    barber: {
      id: 'st-2',
      name: 'Marta Kowalska',
      specialization: 'Hair Stylist & Cut',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    client: {
      id: 'cl-2',
      name: 'Karolina Dąbrowska',
      email: 'karolina.d@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'bk-103',
    barberId: 'st-3',
    clientId: 'cl-3',
    serviceId: 'srv-3',
    startTime: '2026-09-25T10:30:00.000Z',
    endTime: '2026-09-25T11:20:00.000Z',
    status: 'CONFIRMED',
    notes: 'Konturowanie brody na ostro.',
    createdAt: '2026-09-25T08:00:00.000Z',
    service: {
      id: 'srv-3',
      name: 'Strzyżenie Męskie & Brody',
      durationMin: 50,
      price: 140,
    },
    barber: {
      id: 'st-3',
      name: 'Piotr Zieliński',
      specialization: 'Master Barber',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    client: {
      id: 'cl-3',
      name: 'Tomasz Majewski',
      email: 'tomasz.m@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  },
];

const fallbackServices: ServiceApi[] = [
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
    category: 'Haircut',
    description: 'Personalized haircut tailored to facial geometry and hair density.',
  },
  {
    id: 'srv-3',
    name: 'Strzyżenie Męskie & Brody',
    durationMin: 50,
    price: 140,
    category: 'Barbering',
    description: 'Precision clipper and scissor cut with straight-razor contouring.',
  },
  {
    id: 'srv-4',
    name: 'Rytuał Odbudowy Keratynowej',
    durationMin: 75,
    price: 240,
    category: 'Care',
    description: 'Intense keratin reconstructive treatment with steam hydration.',
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onViewChange }) => {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingApi | null>(null);

  const dateIsoString = currentDate.toISOString().split('T')[0] ?? '';

  const { data: barbersData } = useQuery<BarberApi[]>({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    retry: 1,
  });

  const { data: servicesData } = useQuery<ServiceApi[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
    retry: 1,
  });

  const { data: bookingsData } = useQuery<BookingApi[]>({
    queryKey: ['bookings', dateIsoString],
    queryFn: () => fetchBookings(dateIsoString),
    retry: 1,
  });

  const barbers = barbersData && barbersData.length > 0 ? barbersData : fallbackBarbers;
  const services = servicesData && servicesData.length > 0 ? servicesData : fallbackServices;
  const bookings = bookingsData && bookingsData.length > 0 ? bookingsData : fallbackBookings;

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookings;
    }
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        (b.client.name?.toLowerCase().includes(q) ?? false) ||
        b.client.email.toLowerCase().includes(q) ||
        b.service.name.toLowerCase().includes(q) ||
        (b.barber.name?.toLowerCase().includes(q) ?? false)
    );
  }, [bookings, searchQuery]);

  const selectedBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) ?? bookings[0] ?? null;
  }, [bookings, selectedBookingId]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleUpdateStatus = (bookingId: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED') => {
    statusMutation.mutate({ id: bookingId, status });
  };

  const handleOpenReschedule = (booking: BookingApi) => {
    setRescheduleTarget(booking);
    setIsRescheduleModalOpen(true);
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
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

  return (
    <div className="h-screen w-screen bg-paper-100 text-charcoal-700 font-sans antialiased overflow-hidden flex select-none">
      <SidebarNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onSwitchToClient={() => onViewChange('client')}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <MetricsCards
          totalBookings={bookings.length}
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
          />
        </div>
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
    </div>
  );
};
