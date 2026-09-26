import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

export class ClientsController {
  static async getAll(_req: Request, res: Response): Promise<void> {
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
    } catch {
      res.status(500).json({ error: 'FAILED_TO_FETCH_CLIENTS' });
    }
  }
}
