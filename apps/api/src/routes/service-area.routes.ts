import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export const serviceAreaRouter = Router();

serviceAreaRouter.get('/', async (req, res, next) => {
  try {
    const areas = await prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: areas });
  } catch (err) {
    next(err);
  }
});

const areaSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().default(20.0),
});

serviceAreaRouter.post('/', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const data = areaSchema.parse(req.body);
    const area = await prisma.serviceArea.create({ data });
    res.status(201).json({ success: true, data: area });
  } catch (err) {
    next(err);
  }
});
