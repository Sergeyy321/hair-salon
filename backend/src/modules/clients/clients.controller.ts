import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export class ClientsController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: { clientBookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(clients);
    } catch (err: unknown) {
      next(err);
    }
  }
}
