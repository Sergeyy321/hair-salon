import { prisma } from '../../config/prisma';

export class ServicesService {
  static async getAll() {
    return prisma.service.findMany({
      include: {
        barbers: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async getById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        barbers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
