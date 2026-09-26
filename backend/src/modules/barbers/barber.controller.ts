import { Request, Response } from 'express';
import { BarbersService } from './barber.service';

export class BarbersController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const barbers = await BarbersService.getAll();
      res.json(barbers);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_BARBERS' });
    }
  }
}
