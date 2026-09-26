import { Request, Response } from 'express';
import { ServicesService } from './services.service';

export class ServicesController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const services = await ServicesService.getAll();
      res.json(services);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_SERVICES' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'INVALID_SERVICE_ID' });
        return;
      }
      const service = await ServicesService.getById(id);
      if (!service) {
        res.status(404).json({ error: 'SERVICE_NOT_FOUND' });
        return;
      }
      res.json(service);
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_SERVICE' });
    }
  }
}
