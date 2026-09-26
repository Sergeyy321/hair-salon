import { Request, Response } from 'express';
import { BookingsService } from './booking.service';
import { createBookingSchema, availabilityQuerySchema, rescheduleBookingSchema } from './booking.schema';
import { z } from 'zod';

export class BookingsController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createBookingSchema.parse(req.body);
      const booking = await BookingsService.createBooking({
        barberId: parsed.barberId,
        serviceId: parsed.serviceId,
        startTime: parsed.startTime,
        clientId: parsed.clientId,
        clientName: parsed.clientName,
        clientPhone: parsed.clientPhone,
        clientEmail: parsed.clientEmail,
        notes: parsed.notes,
      });
      res.status(201).json(booking);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues });
        return;
      }
      if (err instanceof Error) {
        if (err.message === 'CANNOT_BOOK_SELF') {
          res.status(400).json({ error: 'CANNOT_BOOK_SELF', message: 'Staff members cannot book appointments with themselves.' });
          return;
        }
        if (err.message === 'BARBER_NOT_FOUND') {
          res.status(404).json({ error: 'BARBER_NOT_FOUND', message: 'Selected specialist not found.' });
          return;
        }
        if (err.message === 'SERVICE_NOT_FOUND') {
          res.status(404).json({ error: 'SERVICE_NOT_FOUND' });
          return;
        }
        if (err.message === 'SLOT_ALREADY_BOOKED' || err.message === 'NO_BARBERS_AVAILABLE') {
          res.status(409).json({ error: 'SLOT_ALREADY_BOOKED' });
          return;
        }
      }
      res.status(500).json({ error: 'FAILED_TO_CREATE_BOOKING' });
    }
  }

  static async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const parsed = availabilityQuerySchema.parse({
        barberId: req.query['barberId'],
        date: req.query['date'],
      });
      const busySlots = await BookingsService.getBarberAvailability(
        parsed.barberId,
        parsed.date
      );
      res.json(busySlots);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues });
        return;
      }
      res.status(500).json({ error: 'FAILED_TO_FETCH_AVAILABILITY' });
    }
  }

  static async getDaySchedule(req: Request, res: Response): Promise<void> {
    try {
      const rawDate = req.query['date'];
      const dateStr = typeof rawDate === 'string' ? rawDate : new Date().toISOString();
      const date = new Date(dateStr);
      const bookings = await BookingsService.getDayBookings(date);
      res.json(bookings);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_SCHEDULE' });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'INVALID_BOOKING_ID' });
        return;
      }
      const status = req.body.status;
      if (status !== 'CONFIRMED' && status !== 'PENDING' && status !== 'CANCELLED') {
        res.status(400).json({ error: 'INVALID_STATUS' });
        return;
      }
      const updated = await BookingsService.updateStatus(id, status);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_UPDATE_STATUS' });
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'INVALID_BOOKING_ID' });
        return;
      }
      const updated = await BookingsService.updateStatus(id, 'CANCELLED');
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_CANCEL_BOOKING' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'INVALID_BOOKING_ID' });
        return;
      }
      await BookingsService.deleteBooking(id);
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'FAILED_TO_DELETE_BOOKING' });
    }
  }

  static async reschedule(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'INVALID_BOOKING_ID' });
        return;
      }
      const parsed = rescheduleBookingSchema.parse(req.body);
      const updated = await BookingsService.reschedule(id, parsed.startTime);
      res.json(updated);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues });
        return;
      }
      if (err instanceof Error) {
        if (err.message === 'BOOKING_NOT_FOUND') {
          res.status(404).json({ error: 'BOOKING_NOT_FOUND' });
          return;
        }
        if (err.message === 'SLOT_ALREADY_BOOKED') {
          res.status(409).json({ error: 'SLOT_ALREADY_BOOKED' });
          return;
        }
      }
      res.status(500).json({ error: 'FAILED_TO_RESCHEDULE' });
    }
  }

  static async getMyBookings(req: Request, res: Response): Promise<void> {
    try {
      const clientIdOrSub = req.query['sub'] || req.query['clientId'] || req.query['userId'] || req.query['email'];
      if (typeof clientIdOrSub !== 'string') {
        res.status(400).json({ error: 'CLIENT_ID_OR_SUB_REQUIRED' });
        return;
      }
      const bookings = await BookingsService.getClientBookings(clientIdOrSub);
      res.json(bookings);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_CLIENT_BOOKINGS' });
    }
  }
}
