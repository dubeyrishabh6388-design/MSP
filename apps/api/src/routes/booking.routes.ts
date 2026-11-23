import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus, PaymentStatus } from '@prisma/client';
import { VALID_STATUS_TRANSITIONS } from '@serviqa/shared';

export const bookingRouter = Router();

// GET bookings list (scoped)
bookingRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.user!;
    const status = req.query.status as BookingStatus | undefined;

    let bookings;

    if (role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!customer) throw new ApiError(404, 'Customer profile not found');

      bookings = await prisma.booking.findMany({
        where: {
          customerId: customer.id,
          ...(status ? { status } : {}),
        },
        include: {
          request: { include: { category: true } },
          provider: { include: { user: { select: { id: true, name: true, phone: true } } } },
          address: true,
          payment: true,
          review: true,
          priceRevisions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === UserRole.PROVIDER) {
      const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!provider) throw new ApiError(404, 'Provider profile not found');

      bookings = await prisma.booking.findMany({
        where: {
          providerId: provider.id,
          ...(status ? { status } : {}),
        },
        include: {
          request: { include: { category: true } },
          customer: { include: { user: { select: { id: true, name: true, phone: true } } } },
          address: true,
          payment: true,
          priceRevisions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin / Support
      bookings = await prisma.booking.findMany({
        where: { ...(status ? { status } : {}) },
        include: {
          request: { include: { category: true } },
          customer: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
          provider: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
          address: true,
          payment: true,
          review: true,
          priceRevisions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
});

// GET single booking with full timeline
bookingRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        request: { include: { category: true, attachments: true } },
        customer: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        provider: { include: { user: { select: { id: true, name: true, email: true, phone: true } }, badges: true } },
        quotation: { include: { lineItems: true } },
        address: true,
        statusEvents: { orderBy: { createdAt: 'desc' } },
        priceRevisions: { orderBy: { createdAt: 'desc' } },
        payment: { include: { refunds: true } },
        review: true,
        complaint: true,
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

const transitionStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  note: z.string().optional(),
});

// POST Transition booking state
bookingRouter.post('/:id/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status: targetStatus, note } = transitionStatusSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { include: { user: true } },
        provider: { include: { user: true } },
        request: true,
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');

    // State machine check
    const allowedTargets = VALID_STATUS_TRANSITIONS[booking.status as keyof typeof VALID_STATUS_TRANSITIONS] || [];
    if (!allowedTargets.includes(targetStatus as any)) {
      throw new ApiError(400, `Cannot transition booking from ${booking.status} to ${targetStatus}`);
    }

    // Role-specific transition permissions
    if (req.user!.role === UserRole.PROVIDER) {
      if (booking.provider.userId !== req.user!.id) {
        throw new ApiError(403, 'Unauthorized');
      }
      // Providers can dispatch, start work, submit completion
      const providerAllowed: BookingStatus[] = [BookingStatus.PROVIDER_EN_ROUTE, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETION_SUBMITTED];
      if (!providerAllowed.includes(targetStatus)) {
        throw new ApiError(403, `Provider cannot transition booking directly to ${targetStatus}`);
      }
    } else if (req.user!.role === UserRole.CUSTOMER) {
      if (booking.customer.userId !== req.user!.id) {
        throw new ApiError(403, 'Unauthorized');
      }
      // Customers can confirm completion, cancel (before work), or dispute
      const customerAllowed: BookingStatus[] = [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.DISPUTED];
      if (!customerAllowed.includes(targetStatus)) {
        throw new ApiError(403, `Customer cannot transition booking directly to ${targetStatus}`);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: booking.id },
        data: { status: targetStatus },
      });

      await tx.serviceRequest.update({
        where: { id: booking.requestId },
        data: { status: targetStatus },
      });

      await tx.bookingStatusEvent.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: targetStatus,
          actorRole: req.user!.role,
          actorId: req.user!.id,
          note: note || `State transitioned to ${targetStatus}`,
        },
      });

      // If completed, increment provider stats and create settlement record
      if (targetStatus === BookingStatus.COMPLETED) {
        await tx.providerProfile.update({
          where: { id: booking.providerId },
          data: { completedJobsCount: { increment: 1 } },
        });

        await tx.providerSettlement.create({
          data: {
            providerId: booking.providerId,
            amount: booking.providerAmount,
            status: 'PENDING',
          },
        });
      }

      // Notify recipient
      const recipientUserId = req.user!.role === UserRole.PROVIDER ? booking.customer.userId : booking.provider.userId;
      await tx.notification.create({
        data: {
          userId: recipientUserId,
          title: `Booking Update: #${booking.bookingNumber}`,
          message: `Booking #${booking.bookingNumber} is now ${targetStatus.replace(/_/g, ' ')}.`,
          link: `/bookings/${booking.id}`,
        },
      });

      return b;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

const priceRevisionSchema = z.object({
  addedAmount: z.number().int().min(1), // in minor units
  reason: z.string().min(5),
});

// POST Provider submits price revision
bookingRouter.post('/:id/price-revision', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) {
      throw new ApiError(403, 'Only the service provider can submit price revisions');
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        provider: true,
        customer: { include: { user: true } },
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');
    if (booking.provider.userId !== req.user!.id) throw new ApiError(403, 'Unauthorized');
    if (booking.status !== BookingStatus.IN_PROGRESS && booking.status !== BookingStatus.CONFIRMED) {
      throw new ApiError(400, 'Price revisions can only be added while booking is active or in progress');
    }

    const { addedAmount, reason } = priceRevisionSchema.parse(req.body);

    const revision = await prisma.$transaction(async (tx) => {
      const rev = await tx.bookingPriceRevision.create({
        data: {
          bookingId: booking.id,
          addedAmount,
          reason,
          isApproved: false,
        },
      });

      // Notify customer for approval
      await tx.notification.create({
        data: {
          userId: booking.customer.userId,
          title: 'Additional Charge Approval Required',
          message: `Provider requested an additional ₹${(addedAmount / 100).toFixed(2)} for "${reason}". Please review and approve.`,
          link: `/customer/bookings/${booking.id}`,
        },
      });

      return rev;
    });

    res.status(201).json({ success: true, data: revision });
  } catch (err) {
    next(err);
  }
});

// POST Customer approves price revision
bookingRouter.post('/:id/approve-price-revision', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.CUSTOMER) {
      throw new ApiError(403, 'Only the customer can approve price revisions');
    }

    const { revisionId } = z.object({ revisionId: z.string() }).parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        provider: { include: { user: true } },
        request: { include: { category: true } },
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');
    if (booking.customer.userId !== req.user!.id) throw new ApiError(403, 'Unauthorized');

    const revision = await prisma.bookingPriceRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision || revision.bookingId !== booking.id) {
      throw new ApiError(404, 'Price revision not found');
    }
    if (revision.isApproved) {
      throw new ApiError(400, 'Price revision has already been approved');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      await tx.bookingPriceRevision.update({
        where: { id: revisionId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: req.user!.id,
        },
      });

      // Recalculate totals
      const commissionRate = booking.request.category.commissionRate || 10.0;
      const newAgreedAmount = booking.agreedAmount + revision.addedAmount;
      const newPlatformFee = Math.round((newAgreedAmount * commissionRate) / 100);
      const newProviderAmount = newAgreedAmount - newPlatformFee;

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          agreedAmount: newAgreedAmount,
          platformFee: newPlatformFee,
          providerAmount: newProviderAmount,
        },
      });

      // Update payment record
      await tx.payment.updateMany({
        where: { bookingId: booking.id },
        data: { amount: newAgreedAmount },
      });

      // Notify provider
      await tx.notification.create({
        data: {
          userId: booking.provider.userId,
          title: 'Additional Charge Approved',
          message: `Customer approved additional ₹${(revision.addedAmount / 100).toFixed(2)}. Total updated to ₹${(newAgreedAmount / 100).toFixed(2)}.`,
          link: `/provider/bookings/${booking.id}`,
        },
      });

      return updated;
    });

    res.json({ success: true, data: updatedBooking });
  } catch (err) {
    next(err);
  }
});
