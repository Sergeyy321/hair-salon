import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';
import {
  isSuperadminEmail,
  DEFAULT_DIRECTOR_AVATAR,
  DEFAULT_CLIENT_AVATAR,
  DEFAULT_DIRECTOR_NAME,
  DEFAULT_CLIENT_NAME,
} from '../../constants/defaults';

const syncSchema = z.object({
  logtoSub: z.string().min(1),
  email: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim().toLowerCase() : undefined)),
  name: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  picture: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  role: z.enum(['CLIENT', 'BARBER', 'ADMIN', 'SALON_DIRECTOR']).optional(),
});

export class AuthController {
  static async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = syncSchema.parse(req.body);
      const email = data.email || `${data.logtoSub}@client.local`;

      const isDirector = isSuperadminEmail(data.email);
      const defaultRole: Role = isDirector ? 'SALON_DIRECTOR' : 'CLIENT';

      const updateData: {
        name?: string;
        avatarUrl?: string;
        email?: string;
        role?: Role;
        specialization?: string | null;
      } = {};
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

      if (
        existingUser &&
        existingUser.role === 'SALON_DIRECTOR' &&
        !isDirector &&
        !existingUser.email.endsWith('@lume.salon')
      ) {
        updateData.role = 'CLIENT';
        updateData.specialization = null;
      }

      const user = await prisma.user.upsert({
        where: { logtoSub: data.logtoSub },
        update: updateData,
        create: {
          logtoSub: data.logtoSub,
          email,
          name: data.name ?? (defaultRole === 'SALON_DIRECTOR' ? DEFAULT_DIRECTOR_NAME : DEFAULT_CLIENT_NAME),
          role: defaultRole,
          specialization: defaultRole === 'SALON_DIRECTOR' ? 'Salon Director' : null,
          avatarUrl:
            data.picture ??
            (defaultRole === 'SALON_DIRECTOR' ? DEFAULT_DIRECTOR_AVATAR : DEFAULT_CLIENT_AVATAR),
        },
      });

      res.json({ user });
    } catch (err: unknown) {
      next(err);
    }
  }
}
