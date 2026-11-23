import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus, QuotationStatus, PaymentStatus } from '@prisma/client';

export const quotationRouter = Router();

const quotationLineItemSchema = z.object({
  description: z.string().min(2),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().int().min(0),
});

const submitQuotationSchema = z.object({
  requestId: z.string(),
  estimatedHours: z.number().int().min(1).default(2),
  notes: z.string().optional(),
  validDays: z.number().int().min(1).max(30).default(7),
  lineItems: z.array(quotationLineItemSchema).min(1),
});

// POST Provider: submit quotation
quotationRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) {
      throw new ApiError(403, 'Only service providers can submit quotations');
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const data = submitQuotationSchema.parse(req.body);

    const request = await prisma.serviceRequest.findUnique({
      where: { id: data.requestId },
      include: { customer: { include: { user: true } } },
    });
    if (!request) throw new ApiError(404, 'Service request not found');

    if (request.status !== BookingStatus.REQUESTED && request.status !== BookingStatus.MATCHING && request.status !== BookingStatus.QUOTATIONS_RECEIVED) {
      throw new ApiError(400, 'This request is no longer accepting quotations');
    }

    // Check if quotation already submitted by this provider
    const existing = await prisma.quotation.findUnique({
      where: {
        requestId_providerId: {
          requestId: data.requestId,
          providerId: provider.id,
        },
      },
    });
    if (existing) {
      throw new ApiError(400, 'You have already submitted a quotation for this request');
    }

    const totalAmount = data.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + data.validDays);

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          requestId: data.requestId,
          providerId: provider.id,
          totalAmount,
          estimatedHours: data.estimatedHours,
          notes: data.notes,
          validUntil,
          status: QuotationStatus.SUBMITTED,
          lineItems: {
            create: data.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: { lineItems: true },
      });

      // Update request status to QUOTATIONS_RECEIVED
      await tx.serviceRequest.update({
        where: { id: data.requestId },
        data: { status: BookingStatus.QUOTATIONS_RECEIVED },
      });

      // Notify customer
      await tx.notification.create({
        data: {
          userId: request.customer.userId,
          title: 'New Quotation Received',
          message: `${provider.businessName || 'A provider'} submitted a quotation of ₹${(totalAmount / 100).toFixed(2)} for "${request.title}"`,
          link: `/customer/requests/${request.id}`,
        },
      });

      return q;
    });

    res.status(201).json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
});

// GET Compare quotations for a request
quotationRouter.get('/request/:requestId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { requestId: req.params.requestId },
      include: {
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            badges: true,
          },
        },
        lineItems: true,
      },
      orderBy: { totalAmount: 'asc' },
    });

    res.json({ success: true, data: quotations });
  } catch (err) {
    next(err);
  }
});

// POST Customer: accept quotation and convert to confirmed booking
quotationRouter.post('/:id/accept', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.CUSTOMER) {
      throw new ApiError(403, 'Only customers can accept quotations');
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!customer) throw new ApiError(404, 'Customer profile not found');

    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        request: { include: { category: true } },
        provider: { include: { user: true } },
      },
    });

    if (!quotation) throw new ApiError(404, 'Quotation not found');
    if (quotation.request.customerId !== customer.id) {
      throw new ApiError(403, 'Unauthorized to accept quotation for this request');
    }

    if (new Date() > quotation.validUntil) {
      throw new ApiError(400, 'This quotation has expired');
    }

    // Atomic transaction to create booking, mark accepted, and reject competing quotes
    const booking = await prisma.$transaction(async (tx) => {
      // Check if booking already exists for this request (concurrency safeguard)
      const existingBooking = await tx.booking.findUnique({
        where: { requestId: quotation.requestId },
      });
      if (existingBooking) {
        throw new ApiError(409, 'A booking has already been confirmed for this service request');
      }

      // Mark this quotation accepted
      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: QuotationStatus.ACCEPTED },
      });

      // Mark other quotes for this request rejected
      await tx.quotation.updateMany({
        where: {
          requestId: quotation.requestId,
          id: { not: quotation.id },
        },
        data: { status: QuotationStatus.REJECTED },
      });

      // Calculate platform fee and provider amount
      const commissionRate = quotation.request.category.commissionRate || 10.0;
      const platformFee = Math.round((quotation.totalAmount * commissionRate) / 100);
      const providerAmount = quotation.totalAmount - platformFee;

      const bookingNumber = `SRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          requestId: quotation.requestId,
          customerId: customer.id,
          providerId: quotation.providerId,
          quotationId: quotation.id,
          addressId: quotation.request.addressId,
          status: BookingStatus.CONFIRMED,
          scheduledDate: quotation.request.preferredDate,
          agreedAmount: quotation.totalAmount,
          platformFee,
          providerAmount,
        },
      });

      // Update service request status to CONFIRMED
      await tx.serviceRequest.update({
        where: { id: quotation.requestId },
        data: { status: BookingStatus.CONFIRMED },
      });

      // Create Booking Status Event
      await tx.bookingStatusEvent.create({
        data: {
          bookingId: newBooking.id,
          fromStatus: BookingStatus.QUOTATIONS_RECEIVED,
          toStatus: BookingStatus.CONFIRMED,
          actorRole: UserRole.CUSTOMER,
          actorId: req.user!.id,
          note: `Quotation accepted for ₹${(quotation.totalAmount / 100).toFixed(2)}`,
        },
      });

      // Create Payment placeholder
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: quotation.totalAmount,
          currency: 'INR',
          status: PaymentStatus.AUTHORIZED,
          paymentGateway: 'MANUAL_SANDBOX',
          gatewayTxnId: `TXN_${Date.now()}_${bookingNumber}`,
          idempotencyKey: `IDEMP_${newBooking.id}`,
          paidAt: new Date(),
        },
      });

      // Notify Provider
      await tx.notification.create({
        data: {
          userId: quotation.provider.userId,
          title: 'Quotation Accepted! Booking Confirmed',
          message: `Your quote for "${quotation.request.title}" has been accepted. Booking #${bookingNumber} is confirmed.`,
          link: `/provider/bookings/${newBooking.id}`,
        },
      });

      return newBooking;
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});
