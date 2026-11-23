import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, VerificationStatus, BookingStatus } from '@prisma/client';

export const providerRouter = Router();

// GET public / customer view of verified providers
providerRouter.get('/', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;

    const providers = await prisma.providerProfile.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        isAvailable: true,
        ...(categoryId
          ? {
              services: {
                some: { categoryId, isActive: true },
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        services: { include: { category: true } },
        badges: true,
      },
      orderBy: { averageRating: 'desc' },
    });

    res.json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
});

// GET current provider's own profile
providerRouter.get('/my/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        services: { include: { category: true } },
        badges: true,
        verifications: true,
      },
    });

    if (!provider) throw new ApiError(404, 'Provider profile not found');

    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
});

// GET current provider's verifications
providerRouter.get('/my/verifications', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const verifications = await prisma.providerVerification.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: verifications });
  } catch (err) {
    next(err);
  }
});

// GET single provider details with reviews
providerRouter.get('/:id', async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, createdAt: true } },
        services: { include: { category: true } },
        badges: true,
        reviews: {
          include: { customer: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!provider) throw new ApiError(404, 'Provider not found');

    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
});

// PUT Provider updates their profile
const updateProfileSchema = z.object({
  businessName: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().optional(),
  serviceRadiusKm: z.number().optional(),
  isAvailable: z.boolean().optional(),
  payoutAccountNumber: z.string().optional(),
  payoutIfscCode: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

providerRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const data = updateProfileSchema.parse(req.body);
    const { categoryIds, ...profileFields } = data;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.providerProfile.update({
        where: { id: provider.id },
        data: profileFields,
      });

      if (categoryIds) {
        await tx.providerService.deleteMany({ where: { providerId: provider.id } });
        for (const catId of categoryIds) {
          await tx.providerService.create({
            data: {
              providerId: provider.id,
              categoryId: catId,
            },
          });
        }
      }

      return p;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// POST Provider submits verification document
const verificationDocSchema = z.object({
  documentType: z.string().min(2),
  documentNumber: z.string().min(2),
  fileUrl: z.string().min(2),
});

providerRouter.post('/verifications', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const data = verificationDocSchema.parse(req.body);

    const doc = await prisma.providerVerification.create({
      data: {
        providerId: provider.id,
        ...data,
        status: VerificationStatus.PENDING,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// GET Provider earnings & settlement ledger
providerRouter.get('/my/earnings', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const completedBookings = await prisma.booking.findMany({
      where: {
        providerId: provider.id,
        status: BookingStatus.COMPLETED,
      },
      select: {
        id: true,
        bookingNumber: true,
        agreedAmount: true,
        platformFee: true,
        providerAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const settlements = await prisma.providerSettlement.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = completedBookings.reduce((sum, b) => sum + b.agreedAmount, 0);
    const totalPlatformFee = completedBookings.reduce((sum, b) => sum + b.platformFee, 0);
    const totalNetEarned = completedBookings.reduce((sum, b) => sum + b.providerAmount, 0);
    const totalSettled = settlements.filter(s => s.status === 'PROCESSED').reduce((sum, s) => sum + s.amount, 0);
    const pendingSettlement = totalNetEarned - totalSettled;

    res.json({
      success: true,
      data: {
        summary: {
          totalGross,
          totalPlatformFee,
          totalNetEarned,
          totalSettled,
          pendingSettlement,
          completedCount: completedBookings.length,
        },
        bookings: completedBookings,
        settlements,
      },
    });
  } catch (err) {
    next(err);
  }
});
