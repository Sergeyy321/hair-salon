import { z } from 'zod';

export const RoleSchema = z.enum(['CLIENT', 'BARBER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const BookingStatusSchema = z.enum(['CONFIRMED', 'PENDING', 'CANCELLED']);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMin: z.number().int().positive(),
  price: z.number().positive(),
  category: z.string(),
  description: z.string(),
});
export type Service = z.infer<typeof ServiceSchema>;

export const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: RoleSchema,
  specialization: z.string(),
  avatarUrl: z.string().optional(),
});
export type StaffMember = z.infer<typeof StaffMemberSchema>;

export const TimeSlotSchema = z.object({
  time: z.string(),
  available: z.boolean(),
  period: z.enum(['morning', 'afternoon', 'evening']),
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const BookingRecordSchema = z.object({
  id: z.string(),
  barberId: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
  clientEmail: z.string().email().optional(),
  serviceName: z.string(),
  masterName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.string(),
  status: BookingStatusSchema,
  notes: z.string().optional(),
  startMinute: z.number(),
  durationMinutes: z.number(),
});
export type BookingRecord = z.infer<typeof BookingRecordSchema>;

export const ClientBookingFormSchema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  clientName: z.string().trim().min(2),
  clientPhone: z.string().trim().min(7),
  clientEmail: z.string().email(),
  notes: z.string().optional(),
});
export type ClientBookingForm = z.infer<typeof ClientBookingFormSchema>;
