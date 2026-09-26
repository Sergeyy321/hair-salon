import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

const syncSchema = z.object({
  logtoSub: z.string().min(1),
  email: z.string().optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim().toLowerCase() : undefined)),
  name: z.string().optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  picture: z.string().optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  role: z.enum(['CLIENT', 'BARBER', 'ADMIN', 'SALON_DIRECTOR']).optional(),
});

export class AuthController {
  static async sync(req: Request, res: Response): Promise<void> {
    try {
      const data = syncSchema.parse(req.body);
      const email = data.email || `${data.logtoSub}@client.local`;

      const isDirector = email === 'borawiy457@kingdais.com';
      const defaultRole: Role = isDirector ? 'SALON_DIRECTOR' : 'CLIENT';

      const updateData: { name?: string; avatarUrl?: string; email?: string; role?: Role; specialization?: string | null } = {};
      if (data.name) {
        updateData.name = data.name;
      }
      if (data.picture) {
        updateData.avatarUrl = data.picture;
      }
      if (data.email) {
        updateData.email = data.email;
      }

      const existingUser = await prisma.user.findUnique({
        where: { logtoSub: data.logtoSub },
      });

      if (existingUser && existingUser.role === 'SALON_DIRECTOR' && !isDirector && !existingUser.email.endsWith('@lume.salon')) {
        updateData.role = 'CLIENT';
        updateData.specialization = null;
      }

      const user = await prisma.user.upsert({
        where: { logtoSub: data.logtoSub },
        update: updateData,
        create: {
          logtoSub: data.logtoSub,
          email,
          name: data.name ?? (defaultRole === 'SALON_DIRECTOR' ? 'Sarah Mitchell' : 'Lumé Client'),
          role: defaultRole,
          specialization: defaultRole === 'SALON_DIRECTOR' ? 'Salon Director' : null,
          avatarUrl: data.picture ?? (defaultRole === 'SALON_DIRECTOR'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'),
        },
      });

      res.json({ user });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues });
        return;
      }
      res.status(500).json({ error: 'FAILED_TO_SYNC_USER' });
    }
  }
}
