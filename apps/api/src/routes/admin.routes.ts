import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, VerificationStatus } from '@prisma/client';

export const adminRouter = Router();

// GET all provider verifications
adminRouter.get('/verifications', authenticate, authorize(UserRole.ADMIN, UserRole.SUPPORT_STAFF), async (req: AuthRequest, res: Response, next) => {
  try {
    const status = req.query.status as VerificationStatus | undefined;
    const verifications = await prisma.providerVerification.findMany({
      where: { ...(status ? { status } : {}) },
      include: {
        provider: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            services: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: verifications });
  } catch (err) {
    next(err);
  }
});

// PUT Review provider verification (Approve or Reject)
const reviewVerificationSchema = z.object({
  status: z.enum([VerificationStatus.VERIFIED, VerificationStatus.REJECTED]),
  rejectionReason: z.string().optional(),
});

adminRouter.put('/verifications/:id/review', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = reviewVerificationSchema.parse(req.body);

    const verification = await prisma.providerVerification.findUnique({
      where: { id: req.params.id },
      include: { provider: { include: { user: true } } },
    });

    if (!verification) throw new ApiError(404, 'Verification document not found');

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.providerVerification.update({
        where: { id: verification.id },
        data: {
          status: data.status,
          rejectionReason: data.rejectionReason,
          verifiedAt: data.status === VerificationStatus.VERIFIED ? new Date() : null,
          verifiedBy: req.user!.id,
        },
      });

      // Update provider profile status
      await tx.providerProfile.update({
        where: { id: verification.providerId },
        data: { verificationStatus: data.status },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: data.status === VerificationStatus.VERIFIED ? 'APPROVE_PROVIDER' : 'REJECT_PROVIDER',
          resource: 'ProviderVerification',
          details: { verificationId: v.id, providerId: verification.providerId, reason: data.rejectionReason },
        },
      });

      // Notification to provider
      await tx.notification.create({
        data: {
          userId: verification.provider.userId,
          title: data.status === VerificationStatus.VERIFIED ? 'Verification Approved! 🎉' : 'Verification Update',
          message: data.status === VerificationStatus.VERIFIED
            ? 'Your documents have been verified. You can now accept leads and submit quotations!'
            : `Your verification submission was rejected: ${data.rejectionReason || 'Please resubmit valid documents.'}`,
          link: '/provider/verification',
        },
      });

      return v;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET users list (with filtering)
adminRouter.get('/users', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const role = req.query.role as UserRole | undefined;

    const users = await prisma.user.findMany({
      where: { ...(role ? { role } : {}) },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        customerProfile: true,
        providerProfile: {
          include: { services: { include: { category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// PUT Toggle User Active Status (Suspend / Reactivate)
const userStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().min(5),
});

adminRouter.put('/users/:id/status', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = userStatusSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new ApiError(404, 'User not found');
    if (user.id === req.user!.id) throw new ApiError(400, 'Cannot change status of your own account');

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: { isActive: data.isActive },
      });

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: data.isActive ? 'REACTIVATE_USER' : 'SUSPEND_USER',
          resource: 'User',
          details: { userId: user.id, email: user.email, reason: data.reason },
        },
      });

      return u;
    });

    res.json({ success: true, data: { id: updated.id, isActive: updated.isActive } });
  } catch (err) {
    next(err);
  }
});

// GET System Audit Logs
adminRouter.get('/audit-logs', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

// GET & Process Settlements
adminRouter.get('/settlements', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const settlements = await prisma.providerSettlement.findMany({
      include: {
        provider: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: settlements });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/settlements/:id/process', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const settlement = await prisma.providerSettlement.findUnique({
      where: { id: req.params.id },
    });
    if (!settlement) throw new ApiError(404, 'Settlement not found');

    const updated = await prisma.providerSettlement.update({
      where: { id: settlement.id },
      data: {
        status: 'PROCESSED',
        payoutDate: new Date(),
        referenceId: `SETTL_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
