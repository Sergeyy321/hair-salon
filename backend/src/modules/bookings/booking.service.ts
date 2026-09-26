import { prisma } from '../../config/prisma';

export class BookingsService {
  static async createBooking(data: {
    barberId: string;
    clientId?: string | undefined;
    clientName?: string | undefined;
    clientPhone?: string | undefined;
    clientEmail?: string | undefined;
    serviceId: string;
    startTime: Date;
    notes?: string | undefined;
  }) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new Error('SERVICE_NOT_FOUND');
    }

    const endTime = new Date(data.startTime.getTime() + service.durationMin * 60000);

    let resolvedClientId = data.clientId;
    if (resolvedClientId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: resolvedClientId },
            { logtoSub: resolvedClientId },
          ],
        },
      });
      if (existingUser) {
        resolvedClientId = existingUser.id;
      } else {
        resolvedClientId = undefined;
      }
    }

    if (!resolvedClientId) {
      const email = data.clientEmail || `guest_${Date.now()}@client.local`;
      const client = await prisma.user.upsert({
        where: { email },
        update: {
          name: data.clientName ?? null,
          phone: data.clientPhone ?? null,
        },
        create: {
          logtoSub: `client_guest_${Date.now()}`,
          email,
          name: data.clientName ?? 'Klient Lumé',
          phone: data.clientPhone ?? null,
          role: 'CLIENT',
        },
      });
      resolvedClientId = client.id;
    }

    let finalBarberId = data.barberId;

    if (finalBarberId === 'ANY') {
      const allBarbers = await prisma.user.findMany({
        where: {
          role: 'BARBER',
          id: { not: resolvedClientId },
          ...(data.clientEmail ? { email: { not: data.clientEmail } } : {}),
        },
      });

      if (allBarbers.length === 0) {
        throw new Error('NO_BARBERS_AVAILABLE');
      }

      let selectedFreeBarberId: string | null = null;
      for (const b of allBarbers) {
        const conflict = await prisma.booking.findFirst({
          where: {
            barberId: b.id,
            status: { not: 'CANCELLED' },
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
        });
        if (!conflict) {
          selectedFreeBarberId = b.id;
          break;
        }
      }

      if (!selectedFreeBarberId) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      finalBarberId = selectedFreeBarberId;
    } else {
      const barber = await prisma.user.findUnique({
        where: { id: finalBarberId },
        select: { id: true, email: true, role: true },
      });

      if (!barber || barber.role !== 'BARBER') {
        throw new Error('BARBER_NOT_FOUND');
      }

      if (resolvedClientId && finalBarberId === resolvedClientId) {
        throw new Error('CANNOT_BOOK_SELF');
      }

      if (data.clientEmail && barber.email.toLowerCase() === data.clientEmail.toLowerCase()) {
        throw new Error('CANNOT_BOOK_SELF');
      }

      const conflict = await prisma.booking.findFirst({
        where: {
          barberId: finalBarberId,
          status: { not: 'CANCELLED' },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: data.startTime } },
          ],
        },
      });

      if (conflict) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
    }

    return prisma.booking.create({
      data: {
        barberId: finalBarberId,
        clientId: resolvedClientId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime,
        notes: data.notes ?? null,
        status: 'CONFIRMED',
      },
      include: {
        service: true,
        barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });
  }

  static async getBarberAvailability(barberId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.booking.findMany({
      where: {
        barberId,
        status: { not: 'CANCELLED' },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      select: { startTime: true, endTime: true },
      orderBy: { startTime: 'asc' },
    });
  }

  static async getDayBookings(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.booking.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      include: {
        service: true,
        barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  static async updateStatus(id: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED') {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });
  }

  static async deleteBooking(id: string) {
    return prisma.booking.delete({
      where: { id },
    });
  }

  static async getClientBookings(clientIdOrSub: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: clientIdOrSub },
          { logtoSub: clientIdOrSub },
          { email: clientIdOrSub },
        ],
      },
    });

    if (!user) {
      return prisma.booking.findMany({
        where: {
          client: {
            OR: [
              { email: clientIdOrSub },
              { logtoSub: clientIdOrSub },
            ],
          },
        },
        include: {
          service: true,
          barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
          client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        },
        orderBy: { startTime: 'desc' },
      });
    }

    return prisma.booking.findMany({
      where: {
        OR: [
          { clientId: user.id },
          ...(user.email ? [{ client: { email: user.email } }] : []),
          ...(user.phone ? [{ client: { phone: user.phone } }] : []),
        ],
      },
      include: {
        service: true,
        barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  static async reschedule(id: string, newStartTime: Date) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    const endTime = new Date(newStartTime.getTime() + booking.service.durationMin * 60000);

    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        barberId: booking.barberId,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: newStartTime } },
        ],
      },
    });

    if (conflict) {
      throw new Error('SLOT_ALREADY_BOOKED');
    }

    return prisma.booking.update({
      where: { id },
      data: {
        startTime: newStartTime,
        endTime,
        status: 'CONFIRMED',
      },
      include: {
        service: true,
        barber: { select: { id: true, name: true, avatarUrl: true, specialization: true } },
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });
  }
}