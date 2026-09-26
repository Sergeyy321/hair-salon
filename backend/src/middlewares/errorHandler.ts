import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/appError';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: err.issues,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof Error) {
    switch (err.message) {
      case 'CANNOT_BOOK_SELF':
        res.status(400).json({
          error: 'CANNOT_BOOK_SELF',
          message: 'Staff members cannot book appointments with themselves.',
        });
        return;
      case 'BARBER_NOT_FOUND':
        res.status(404).json({
          error: 'BARBER_NOT_FOUND',
          message: 'Selected specialist not found.',
        });
        return;
      case 'SERVICE_NOT_FOUND':
        res.status(404).json({
          error: 'SERVICE_NOT_FOUND',
          message: 'Service not found.',
        });
        return;
      case 'BOOKING_NOT_FOUND':
        res.status(404).json({
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found.',
        });
        return;
      case 'SLOT_ALREADY_BOOKED':
        res.status(409).json({
          error: 'SLOT_ALREADY_BOOKED',
          message: 'Selected time slot is already booked.',
        });
        return;
      case 'NO_BARBERS_AVAILABLE':
        res.status(409).json({
          error: 'NO_BARBERS_AVAILABLE',
          message: 'No specialists available for the selected slot.',
        });
        return;
      default:
        break;
    }
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
  });
};
