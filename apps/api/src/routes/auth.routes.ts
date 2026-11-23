import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { config } from '../config';
import { ApiError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, VerificationStatus } from '@prisma/client';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum([UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPPORT_STAFF]).default(UserRole.CUSTOMER),
  businessName: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().optional(),
  serviceCategoryIds: z.array(z.string()).optional(),
  serviceRadiusKm: z.number().optional(),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ApiError(400, 'User with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          name: data.name,
          passwordHash,
          role: data.role,
        },
      });

      let customerProfileId: string | undefined;
      let providerProfileId: string | undefined;

      if (data.role === UserRole.CUSTOMER) {
        const customer = await tx.customerProfile.create({
          data: {
            userId: user.id,
            referralCode: 'SRV' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          },
        });
        customerProfileId = customer.id;
      } else if (data.role === UserRole.PROVIDER) {
        const provider = await tx.providerProfile.create({
          data: {
            userId: user.id,
            businessName: data.businessName || data.name,
            bio: data.bio || '',
            experienceYears: data.experienceYears || 1,
            verificationStatus: VerificationStatus.PENDING,
            serviceRadiusKm: data.serviceRadiusKm || 15.0,
          },
        });
        providerProfileId = provider.id;

        // If categories provided, connect provider services
        if (data.serviceCategoryIds && data.serviceCategoryIds.length > 0) {
          for (const catId of data.serviceCategoryIds) {
            await tx.providerService.create({
              data: {
                providerId: provider.id,
                categoryId: catId,
              },
            });
          }
        }
      }

      return { user, customerProfileId, providerProfileId };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        customerProfileId: result.customerProfileId,
        providerProfileId: result.providerProfileId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          customerProfileId: result.customerProfileId,
          providerProfileId: result.providerProfileId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        providerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials or inactive account');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        customerProfileId: user.customerProfile?.id,
        providerProfileId: user.providerProfile?.id,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customerProfileId: user.customerProfile?.id,
          providerProfileId: user.providerProfile?.id,
          verificationStatus: user.providerProfile?.verificationStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        customerProfile: true,
        providerProfile: {
          include: {
            services: { include: { category: true } },
            verifications: true,
            badges: true,
          },
        },
        addresses: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

authRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
