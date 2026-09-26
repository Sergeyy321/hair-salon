const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export interface BarberApi {
  id: string;
  name: string;
  email: string;
  role: 'BARBER';
  avatarUrl?: string | null;
  specialization?: string | null;
  services?: Array<{
    id: string;
    name: string;
    durationMin: number;
    price: number | string;
  }>;
}

export interface ServiceApi {
  id: string;
  name: string;
  durationMin: number;
  price: number | string;
  category?: string | null;
  description?: string | null;
  barbers?: Array<{
    id: string;
    name: string | null;
  }>;
}

export interface BookingApi {
  id: string;
  barberId: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number | string;
  };
  barber: {
    id: string;
    name: string | null;
    avatarUrl?: string | null;
    specialization?: string | null;
  };
  client: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
  };
}

export interface CreateBookingPayload {
  barberId: string;
  serviceId: string;
  startTime: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
}

export const fetchBarbers = async (): Promise<BarberApi[]> => {
  const res = await fetch(`${API_BASE}/api/barbers`);
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_BARBERS');
  }
  return res.json();
};

export const fetchServices = async (): Promise<ServiceApi[]> => {
  const res = await fetch(`${API_BASE}/api/services`);
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_SERVICES');
  }
  return res.json();
};

export const fetchBookings = async (dateStr: string): Promise<BookingApi[]> => {
  const res = await fetch(`${API_BASE}/api/bookings?date=${encodeURIComponent(dateStr)}`);
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_BOOKINGS');
  }
  return res.json();
};

export interface BusySlotApi {
  startTime: string;
  endTime: string;
}

export const fetchBarberAvailability = async (
  barberId: string,
  dateStr: string
): Promise<BusySlotApi[]> => {
  const res = await fetch(
    `${API_BASE}/api/bookings/availability?barberId=${encodeURIComponent(barberId)}&date=${encodeURIComponent(dateStr)}`
  );
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_AVAILABILITY');
  }
  return res.json();
};

export const createBooking = async (
  payload: CreateBookingPayload,
  token?: string
): Promise<BookingApi> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? 'FAILED_TO_CREATE_BOOKING');
  }

  return res.json();
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED',
  token?: string
): Promise<BookingApi> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? 'FAILED_TO_UPDATE_STATUS');
  }

  return res.json();
};

export interface ClientApi {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: {
    clientBookings: number;
  };
}

export const fetchClients = async (): Promise<ClientApi[]> => {
  const res = await fetch(`${API_BASE}/api/clients`);
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_CLIENTS');
  }
  return res.json();
};

export const cancelBooking = async (
  bookingId: string,
  token?: string
): Promise<BookingApi> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? 'FAILED_TO_CANCEL_BOOKING');
  }

  return res.json();
};

export const deleteBooking = async (
  bookingId: string,
  token?: string
): Promise<void> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    throw new Error('FAILED_TO_DELETE_BOOKING');
  }
};

export interface SyncedUser {
  id: string;
  logtoSub: string;
  email: string;
  name: string | null;
  role: 'CLIENT' | 'BARBER' | 'ADMIN' | 'SALON_DIRECTOR';
  avatarUrl?: string | null;
  specialization?: string | null;
}

export const fetchMyBookings = async (sub: string): Promise<BookingApi[]> => {
  const res = await fetch(`${API_BASE}/api/bookings/my?sub=${encodeURIComponent(sub)}`);
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_MY_BOOKINGS');
  }
  return res.json();
};

export const syncUserWithBackend = async (payload: {
  logtoSub: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: 'CLIENT' | 'BARBER' | 'ADMIN' | 'SALON_DIRECTOR';
}): Promise<{ user: SyncedUser }> => {
  const res = await fetch(`${API_BASE}/api/auth/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('FAILED_TO_SYNC_USER');
  }
  return res.json();
};

