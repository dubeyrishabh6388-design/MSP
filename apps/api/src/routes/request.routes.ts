import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, BookingStatus, ServiceWorkflowType, VerificationStatus } from '@prisma/client';

export const requestRouter = Router();

const createRequestSchema = z.object({
  categoryId: z.string(),
  subCategoryId: z.string().optional(),
  serviceAreaId: z.string().optional(),
  addressId: z.string().optional(),
  newAddress: z.object({
    title: z.string().default('Home'),
    addressLine: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  customFieldValues: z.record(z.any()).optional(),
  budgetMin: z.number().int().optional(),
  budgetMax: z.number().int().optional(),
  preferredDate: z.string(),
  timeSlot: z.string().default('Morning'),
});

// POST Create service request
requestRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.CUSTOMER) {
      throw new ApiError(403, 'Only customers can create service requests');
    }

    let customerProfileId = req.user!.customerProfileId;
    if (!customerProfileId) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!customer) throw new ApiError(404, 'Customer profile not found');
      customerProfileId = customer.id;
    }

    const data = createRequestSchema.parse(req.body);

    const category = await prisma.serviceCategory.findUnique({
      where: { id: data.categoryId },
      include: { fields: true },
    });
    if (!category || !category.isActive) {
      throw new ApiError(404, 'Selected category does not exist or is inactive');
    }

    // Dynamic field validation
    if (category.fields && category.fields.length > 0) {
      const submittedFields = data.customFieldValues || {};
      for (const field of category.fields) {
        if (field.required && (submittedFields[field.name] === undefined || submittedFields[field.name] === '')) {
          throw new ApiError(400, `Required field missing: ${field.label}`);
        }
      }
    }

    let addressId = data.addressId;
    if (!addressId) {
      if (!data.newAddress) {
        throw new ApiError(400, 'Either addressId or newAddress details are required');
      }
      const createdAddr = await prisma.address.create({
        data: {
          userId: req.user!.id,
          serviceAreaId: data.serviceAreaId,
          ...data.newAddress,
        },
      });
      addressId = createdAddr.id;
    }

    const scheduledDate = new Date(data.preferredDate);

    const result = await prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.create({
        data: {
          customerId: customerProfileId!,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          serviceAreaId: data.serviceAreaId,
          addressId: addressId!,
          title: data.title,
          description: data.description,
          customFieldValues: data.customFieldValues || {},
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          preferredDate: scheduledDate,
          timeSlot: data.timeSlot,
          status: BookingStatus.REQUESTED,
        },
        include: {
          category: true,
          subCategory: true,
          address: true,
        },
      });

      // Find matching verified providers offering this category
      const matchingProviders = await tx.providerProfile.findMany({
        where: {
          verificationStatus: VerificationStatus.VERIFIED,
          isAvailable: true,
          services: {
            some: {
              categoryId: data.categoryId,
              isActive: true,
            },
          },
        },
        include: { user: true },
      });

      // Notify matching providers
      for (const provider of matchingProviders) {
        await tx.notification.create({
          data: {
            userId: provider.userId,
            title: `New Service Request: ${category.name}`,
            message: `A new request in ${category.name} is available: "${data.title}"`,
            link: `/provider/requests/${serviceRequest.id}`,
          },
        });
      }

      // If workflow is FIXED_PRICE, automatically initialize matching state
      if (category.workflowType === ServiceWorkflowType.FIXED_PRICE) {
        await tx.serviceRequest.update({
          where: { id: serviceRequest.id },
          data: { status: BookingStatus.MATCHING },
        });
      }

      return { serviceRequest, matchedProviderCount: matchingProviders.length };
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET list service requests (scoped by role)
requestRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.user!;
    const status = req.query.status as BookingStatus | undefined;

    let requests;

    if (role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!customer) throw new ApiError(404, 'Customer profile not found');

      requests = await prisma.serviceRequest.findMany({
        where: {
          customerId: customer.id,
          ...(status ? { status } : {}),
        },
        include: {
          category: true,
          subCategory: true,
          address: true,
          quotations: {
            include: { provider: { include: { user: true } } },
          },
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === UserRole.PROVIDER) {
      const provider = await prisma.providerProfile.findUnique({
        where: { userId: req.user!.id },
        include: { services: true },
      });
      if (!provider) throw new ApiError(404, 'Provider profile not found');

      const providerCategoryIds = provider.services.map((s) => s.categoryId);

      requests = await prisma.serviceRequest.findMany({
        where: {
          categoryId: { in: providerCategoryIds },
          status: { in: [BookingStatus.REQUESTED, BookingStatus.MATCHING, BookingStatus.QUOTATIONS_RECEIVED] },
        },
        include: {
          category: true,
          subCategory: true,
          address: { select: { city: true, state: true, postalCode: true, landmark: true } }, // Privacy-conscious: hide precise address line until booking is confirmed
          quotations: {
            where: { providerId: provider.id },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin / Support Staff
      requests = await prisma.serviceRequest.findMany({
        where: { ...(status ? { status } : {}) },
        include: {
          category: true,
          customer: { include: { user: true } },
          address: true,
          quotations: true,
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// GET single request by ID
requestRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        category: { include: { fields: true } },
        subCategory: true,
        address: true,
        customer: { include: { user: { select: { id: true, name: true, email: true } } } },
        quotations: {
          include: {
            provider: {
              include: {
                user: { select: { id: true, name: true } },
                badges: true,
              },
            },
            lineItems: true,
          },
        },
        booking: {
          include: {
            statusEvents: { orderBy: { createdAt: 'desc' } },
            priceRevisions: true,
          },
        },
      },
    });

    if (!request) {
      throw new ApiError(404, 'Service request not found');
    }

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});
