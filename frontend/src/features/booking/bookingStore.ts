import { useState, useCallback } from 'react';

export interface BookingState {
  currentStep: number;
  selectedServiceId: string | null;
  selectedBarberId: string | null;
  selectedDate: string;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  isConfirmed: boolean;
}

const getInitialDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useBookingStore = () => {
  const [state, setState] = useState<BookingState>({
    currentStep: 1,
    selectedServiceId: null,
    selectedBarberId: null,
    selectedDate: getInitialDate(),
    selectedTime: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
    isConfirmed: false,
  });

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: Math.max(1, Math.min(step, 5)) }));
  }, []);

  const selectService = useCallback((serviceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedServiceId: serviceId,
      currentStep: 2,
    }));
  }, []);

  const selectBarber = useCallback((barberId: string) => {
    setState((prev) => ({
      ...prev,
      selectedBarberId: barberId,
      currentStep: 3,
    }));
  }, []);

  const selectDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date, selectedTime: null }));
  }, []);

  const selectTime = useCallback((time: string) => {
    setState((prev) => ({ ...prev, selectedTime: time }));
  }, []);

  const updateField = useCallback((field: keyof BookingState, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const confirmBooking = useCallback(() => {
    setState((prev) => ({ ...prev, isConfirmed: true, currentStep: 5 }));
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      currentStep: 1,
      selectedServiceId: null,
      selectedBarberId: null,
      selectedDate: getInitialDate(),
      selectedTime: null,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      notes: '',
      isConfirmed: false,
    });
  }, []);

  return {
    state,
    setStep,
    selectService,
    selectBarber,
    selectDate,
    selectTime,
    updateField,
    confirmBooking,
    resetBooking,
  };
};
