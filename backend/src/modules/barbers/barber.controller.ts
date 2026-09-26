import { Request, Response, NextFunction } from 'express';
import { BarbersService } from './barber.service';

export class BarbersController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbers = await BarbersService.getAll();
      res.json(barbers);
    } catch (err: unknown) {
      next(err);
    }
  }
}
