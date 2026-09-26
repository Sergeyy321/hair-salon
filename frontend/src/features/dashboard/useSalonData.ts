import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchBarbers,
  fetchServices,
  fetchBookings,
  fetchBarberAvailability,
  updateBookingStatus,
  cancelBooking,
  type BarberApi,
  type ServiceApi,
  type BookingApi,
} from '../../lib/api';
import { DEFAULT_BARBERS, DEFAULT_SERVICES } from '../../constants/defaults';

export const useBarbers = () => {
  const query = useQuery<BarberApi[]>({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const barbers = query.data && query.data.length > 0 ? query.data : DEFAULT_BARBERS;
  return {
    ...query,
    barbers,
  };
};

export const useServices = () => {
  const query = useQuery<ServiceApi[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 300000,
    placeholderData: keepPreviousData,
  });

  const services = query.data && query.data.length > 0 ? query.data : DEFAULT_SERVICES;
  return {
    ...query,
    services,
  };
};

export const useSalonBookings = (dateIsoString: string) => {
  return useQuery<BookingApi[]>({
    queryKey: ['bookings', dateIsoString],
    queryFn: () => fetchBookings(dateIsoString),
    staleTime: 120000,
    placeholderData: keepPreviousData,
  });
};

export const useMasterSchedule = (barberId: string, dateIsoString: string) => {
  return useQuery({
    queryKey: ['availability', barberId, dateIsoString],
    queryFn: () => fetchBarberAvailability(barberId, dateIsoString),
    enabled: Boolean(barberId && dateIsoString),
    staleTime: 60000,
  });
};

export const useBookingMutations = () => {
  const queryClient = useQueryClient();

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
    },
  });

  return {
    statusMutation,
    cancelMutation,
  };
};
