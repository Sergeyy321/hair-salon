import { prisma } from '../../config/prisma';

export class BarbersService {
  static async getAll() {
    return prisma.user.findMany({
      where: { role: 'BARBER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        specialization: true,
        services: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            price: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
