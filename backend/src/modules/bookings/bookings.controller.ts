import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './booking.service';
import { createBookingSchema, availabilityQuerySchema, rescheduleBookingSchema } from './booking.schema';
import { AppError } from '../../errors/appError';

export class BookingsController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(err);
    }
  }

  static async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(err);
    }
  }

  static async getDaySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawDate = req.query['date'];
      const dateStr = typeof rawDate === 'string' ? rawDate : new Date().toISOString();
      const date = new Date(dateStr);
      const bookings = await BookingsService.getDayBookings(date);
      res.json(bookings);
    } catch (err: unknown) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        throw new AppError(400, 'INVALID_BOOKING_ID');
      }
      const status = req.body.status;
      if (status !== 'CONFIRMED' && status !== 'PENDING' && status !== 'CANCELLED') {
        throw new AppError(400, 'INVALID_STATUS');
      }
      const updated = await BookingsService.updateStatus(id, status);
      res.json(updated);
    } catch (err: unknown) {
      next(err);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        throw new AppError(400, 'INVALID_BOOKING_ID');
      }
      const updated = await BookingsService.updateStatus(id, 'CANCELLED');
      res.json(updated);
    } catch (err: unknown) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        throw new AppError(400, 'INVALID_BOOKING_ID');
      }
      await BookingsService.deleteBooking(id);
      res.status(204).send();
    } catch (err: unknown) {
      next(err);
    }
  }

  static async reschedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        throw new AppError(400, 'INVALID_BOOKING_ID');
      }
      const parsed = rescheduleBookingSchema.parse(req.body);
      const updated = await BookingsService.reschedule(id, parsed.startTime);
      res.json(updated);
    } catch (err: unknown) {
      next(err);
    }
  }

  static async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIdOrSub = req.query['sub'] || req.query['clientId'] || req.query['userId'] || req.query['email'];
      if (typeof clientIdOrSub !== 'string') {
        throw new AppError(400, 'CLIENT_ID_OR_SUB_REQUIRED');
      }
      const bookings = await BookingsService.getClientBookings(clientIdOrSub);
      res.json(bookings);
    } catch (err: unknown) {
      next(err);
    }
  }
}
