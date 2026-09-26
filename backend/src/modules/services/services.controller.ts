import { Request, Response, NextFunction } from 'express';
import { ServicesService } from './services.service';
import { AppError } from '../../errors/appError';

export class ServicesController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await ServicesService.getAll();
      res.json(services);
    } catch (err: unknown) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        throw new AppError(400, 'INVALID_SERVICE_ID');
      }
      const service = await ServicesService.getById(id);
      if (!service) {
        throw new AppError(404, 'SERVICE_NOT_FOUND');
      }
      res.json(service);
    } catch (err: unknown) {
      next(err);
    }
  }
}
