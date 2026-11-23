import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus, VerificationStatus, QuotationStatus } from '@prisma/client';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', authenticate, authorize(UserRole.ADMIN, UserRole.SUPPORT_STAFF), async (req: AuthRequest, res: Response, next) => {
  try {
    // 1. User & Provider Counts
    const [
      totalCustomers,
      totalProviders,
      verifiedProviders,
      totalRequests,
      totalQuotations,
      totalBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings,
    ] = await Promise.all([
      prisma.customerProfile.count(),
      prisma.providerProfile.count(),
      prisma.providerProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.serviceRequest.count(),
      prisma.quotation.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { status: { in: [BookingStatus.DISPUTED, BookingStatus.REFUND_PENDING, BookingStatus.REFUNDED] } } }),
    ]);

    // 2. Financial Aggregates
    const financialAggregates = await prisma.booking.aggregate({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETION_SUBMITTED, BookingStatus.COMPLETED] },
      },
      _sum: {
        agreedAmount: true,
        platformFee: true,
        providerAmount: true,
      },
    });

    const grossBookingValue = financialAggregates._sum.agreedAmount || 0;
    const netPlatformRevenue = financialAggregates._sum.platformFee || 0;
    const totalProviderEarnings = financialAggregates._sum.providerAmount || 0;

    // 3. Pending settlements
    const pendingSettlementAgg = await prisma.providerSettlement.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    });
    const pendingSettlements = pendingSettlementAgg._sum.amount || 0;

    // 4. Conversion & operational rates
    const bookingConversionRate = totalRequests > 0 ? parseFloat(((totalBookings / totalRequests) * 100).toFixed(1)) : 0;
    const cancellationRate = totalBookings > 0 ? parseFloat(((cancelledBookings / totalBookings) * 100).toFixed(1)) : 0;
    const complaintRate = totalBookings > 0 ? parseFloat(((disputedBookings / totalBookings) * 100).toFixed(1)) : 0;

    // 5. Category-wise Performance
    const categories = await prisma.serviceCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            serviceRequests: true,
          },
        },
      },
    });

    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const catBookings = await prisma.booking.aggregate({
          where: { request: { categoryId: cat.id } },
          _count: { id: true },
          _sum: { agreedAmount: true, platformFee: true },
        });

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          requestCount: cat._count.serviceRequests,
          bookingCount: catBookings._count.id,
          grossValue: catBookings._sum.agreedAmount || 0,
          revenue: catBookings._sum.platformFee || 0,
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: {
          totalCustomers,
          totalProviders,
          verifiedProviders,
          verificationRate: totalProviders > 0 ? Math.round((verifiedProviders / totalProviders) * 100) : 0,
        },
        operations: {
          totalRequests,
          totalQuotations,
          totalBookings,
          completedBookings,
          cancelledBookings,
          disputedBookings,
          bookingConversionRate,
          cancellationRate,
          complaintRate,
        },
        financials: {
          grossBookingValue,
          netPlatformRevenue,
          totalProviderEarnings,
          pendingSettlements,
          currency: 'INR',
        },
        categoryPerformance: categoryStats,
      },
    });
  } catch (err) {
    next(err);
  }
});
