import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus, ComplaintStatus, PaymentStatus } from '@prisma/client';

export const complaintRouter = Router();

const complaintSchema = z.object({
  bookingId: z.string(),
  subject: z.string().min(5),
  description: z.string().min(10),
});

// POST Customer raises complaint
complaintRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.CUSTOMER) throw new ApiError(403, 'Unauthorized');

    const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!customer) throw new ApiError(404, 'Customer profile not found');

    const data = complaintSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { complaint: true },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');
    if (booking.customerId !== customer.id) throw new ApiError(403, 'Unauthorized');
    if (booking.complaint) throw new ApiError(400, 'A complaint is already open for this booking');

    const complaint = await prisma.$transaction(async (tx) => {
      const comp = await tx.complaint.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          subject: data.subject,
          description: data.description,
          status: ComplaintStatus.OPEN,
        },
      });

      // Move booking to DISPUTED
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.DISPUTED },
      });

      await tx.bookingStatusEvent.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.DISPUTED,
          actorRole: UserRole.CUSTOMER,
          actorId: req.user!.id,
          note: `Dispute opened: ${data.subject}`,
        },
      });

      return comp;
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

// GET complaints list (Admin / Support / Customer)
complaintRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.user!;

    let complaints;
    if (role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      complaints = await prisma.complaint.findMany({
        where: { customerId: customer?.id },
        include: { booking: { include: { provider: { include: { user: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      complaints = await prisma.complaint.findMany({
        include: {
          booking: {
            include: {
              customer: { include: { user: true } },
              provider: { include: { user: true } },
              payment: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ success: true, data: complaints });
  } catch (err) {
    next(err);
  }
});

// PUT Admin resolves complaint
const resolveSchema = z.object({
  resolution: z.string().min(5),
  refundAmount: z.number().int().min(0).optional(), // in minor units
});

complaintRouter.put('/:id/resolve', authenticate, authorize(UserRole.ADMIN, UserRole.SUPPORT_STAFF), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = resolveSchema.parse(req.body);

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        booking: {
          include: { payment: true },
        },
      },
    });

    if (!complaint) throw new ApiError(404, 'Complaint not found');

    const updated = await prisma.$transaction(async (tx) => {
      const comp = await tx.complaint.update({
        where: { id: complaint.id },
        data: {
          status: ComplaintStatus.RESOLVED,
          resolution: data.resolution,
          resolvedAt: new Date(),
        },
      });

      // If refund is requested and payment exists
      if (data.refundAmount && data.refundAmount > 0 && complaint.booking.payment) {
        await tx.refund.create({
          data: {
            paymentId: complaint.booking.payment.id,
            amount: data.refundAmount,
            reason: `Dispute settlement: ${data.resolution}`,
            status: PaymentStatus.CAPTURED,
            processedAt: new Date(),
          },
        });

        await tx.booking.update({
          where: { id: complaint.bookingId },
          data: { status: BookingStatus.REFUNDED },
        });

        await tx.bookingStatusEvent.create({
          data: {
            bookingId: complaint.bookingId,
            fromStatus: BookingStatus.DISPUTED,
            toStatus: BookingStatus.REFUNDED,
            actorRole: req.user!.role,
            actorId: req.user!.id,
            note: `Refund of ₹${(data.refundAmount / 100).toFixed(2)} granted. Dispute resolved.`,
          },
        });
      } else {
        await tx.booking.update({
          where: { id: complaint.bookingId },
          data: { status: BookingStatus.COMPLETED },
        });
      }

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'RESOLVE_COMPLAINT',
          resource: 'Complaint',
          details: { complaintId: complaint.id, resolution: data.resolution, refundAmount: data.refundAmount },
        },
      });

      return comp;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
