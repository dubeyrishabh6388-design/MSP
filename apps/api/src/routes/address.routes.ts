import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

export const addressRouter = Router();

const addressSchema = z.object({
  title: z.string().default('Home'),
  addressLine: z.string().min(3),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

// GET all addresses for current user
addressRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
});

// POST create a new address
addressRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = addressSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: req.user!.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Check if user has any existing addresses; if none, make this default
      const count = await tx.address.count({ where: { userId: req.user!.id } });
      const shouldBeDefault = data.isDefault ?? count === 0;

      return tx.address.create({
        data: {
          userId: req.user!.id,
          title: data.title,
          addressLine: data.addressLine,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: shouldBeDefault,
        },
      });
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// PUT update existing address
addressRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new ApiError(404, 'Address not found');

    const data = addressSchema.partial().parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: req.user!.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: req.params.id },
        data,
      });
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// PUT set as default address
addressRouter.put('/:id/default', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new ApiError(404, 'Address not found');

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
      await tx.address.update({
        where: { id: req.params.id },
        data: { isDefault: true },
      });
    });

    res.json({ success: true, message: 'Address set as default' });
  } catch (err) {
    next(err);
  }
});

// DELETE address
addressRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new ApiError(404, 'Address not found');

    await prisma.address.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Address removed successfully' });
  } catch (err) {
    next(err);
  }
});
