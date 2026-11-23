import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus } from '@prisma/client';

export const reviewRouter = Router();

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

reviewRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.CUSTOMER) throw new ApiError(403, 'Only customers can submit reviews');

    const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!customer) throw new ApiError(404, 'Customer profile not found');

    const data = reviewSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { review: true, provider: true },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');
    if (booking.customerId !== customer.id) throw new ApiError(403, 'Unauthorized');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new ApiError(400, 'Reviews can only be submitted for completed bookings');
    }
    if (booking.review) {
      throw new ApiError(400, 'A review has already been submitted for this booking');
    }

    const review = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          providerId: booking.providerId,
          rating: data.rating,
          comment: data.comment,
        },
      });

      // Recalculate provider average rating
      const allReviews = await tx.review.findMany({
        where: { providerId: booking.providerId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));

      await tx.providerProfile.update({
        where: { id: booking.providerId },
        data: {
          averageRating: avgRating,
          totalReviews: allReviews.length,
        },
      });

      return rev;
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});
