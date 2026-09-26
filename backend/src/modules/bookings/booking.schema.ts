import { z } from 'zod';

export const createBookingSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  startTime: z.string().transform((val) => new Date(val)),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  notes: z.string().optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
});

export const availabilityQuerySchema = z.object({
  barberId: z.string().min(1),
  date: z.string().transform((val) => new Date(val)),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().transform((val) => new Date(val)),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
