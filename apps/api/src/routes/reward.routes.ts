import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, RewardCategory, ConsentStatus } from '@prisma/client';

export const rewardRouter = Router();

// GET active reward programs and transparent scoring rules
rewardRouter.get('/programs', async (req, res, next) => {
  try {
    const programs = await prisma.rewardProgram.findMany({
      where: { isActive: true },
      include: {
        rules: true,
        rewards: {
          include: {
            provider: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { monthYear: 'desc' },
    });

    res.json({ success: true, data: programs });
  } catch (err) {
    next(err);
  }
});

// GET Provider transparent score calculation & breakdown
rewardRouter.get('/my-score', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== UserRole.PROVIDER) throw new ApiError(403, 'Unauthorized');

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        badges: true,
        rewards: { include: { program: true } },
      },
    });
    if (!provider) throw new ApiError(404, 'Provider profile not found');

    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-10"

    // Calculate live reproducible score
    const completedJobs = provider.completedJobsCount;
    const ratingScore = (provider.averageRating / 5.0) * 100;
    const punctualityScore = 98.0; // Punctuality default/calculated
    const qualityScore = 95.0; // Complaint-free rate
    const conductScore = 100.0; // Policy compliance

    // Transparent formula: 30% jobs, 25% ratings, 20% punctuality, 15% quality, 10% conduct
    const compositeScore = Math.round(
      Math.min(completedJobs * 2, 100) * 0.30 +
      ratingScore * 0.25 +
      punctualityScore * 0.20 +
      qualityScore * 0.15 +
      conductScore * 0.10
    );

    // Consent check
    const consent = await prisma.consentRecord.findFirst({
      where: {
        userId: req.user!.id,
        purpose: 'SOCIAL_MEDIA_RECOGNITION',
        status: ConsentStatus.GRANTED,
      },
    });

    res.json({
      success: true,
      data: {
        monthYear: currentMonth,
        compositeScore,
        breakdown: {
          jobsScore: Math.min(completedJobs * 2, 100),
          jobsWeight: '30%',
          ratingScore,
          ratingWeight: '25%',
          punctualityScore,
          punctualityWeight: '20%',
          qualityScore,
          qualityWeight: '15%',
          conductScore,
          conductWeight: '10%',
        },
        badges: provider.badges,
        rewards: provider.rewards,
        hasSocialConsent: !!consent,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST Provider grants or withdraws social media recognition consent
const consentSchema = z.object({
  status: z.enum([ConsentStatus.GRANTED, ConsentStatus.WITHDRAWN]),
});

rewardRouter.post('/consent', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = consentSchema.parse(req.body);

    const record = await prisma.consentRecord.create({
      data: {
        userId: req.user!.id,
        purpose: 'SOCIAL_MEDIA_RECOGNITION',
        status,
        ipAddress: req.ip,
        withdrawnAt: status === ConsentStatus.WITHDRAWN ? new Date() : null,
      },
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// GET social recognition campaigns
rewardRouter.get('/campaigns', async (req, res, next) => {
  try {
    const campaigns = await prisma.socialRecognitionCampaign.findMany({
      where: { isApproved: true },
      include: {
        provider: {
          include: { user: { select: { name: true } }, badges: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
});

// POST Admin creates social recognition campaign (requires provider consent)
const campaignSchema = z.object({
  title: z.string().min(5),
  providerId: z.string(),
  rewardId: z.string().optional(),
  draftCopy: z.string().min(10),
  imageUrl: z.string().optional(),
  isApproved: z.boolean().default(false),
});

rewardRouter.post('/campaigns', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = campaignSchema.parse(req.body);

    const provider = await prisma.providerProfile.findUnique({
      where: { id: data.providerId },
      include: { user: true },
    });
    if (!provider) throw new ApiError(404, 'Provider not found');

    // Verify explicit recorded consent exists
    const consent = await prisma.consentRecord.findFirst({
      where: {
        userId: provider.userId,
        purpose: 'SOCIAL_MEDIA_RECOGNITION',
        status: ConsentStatus.GRANTED,
      },
    });

    if (!consent) {
      throw new ApiError(400, 'Cannot publish recognition campaign: Provider has not granted explicit social media consent.');
    }

    const campaign = await prisma.socialRecognitionCampaign.create({
      data: {
        title: data.title,
        providerId: data.providerId,
        rewardId: data.rewardId,
        draftCopy: data.draftCopy,
        imageUrl: data.imageUrl,
        isApproved: data.isApproved,
        hasConsent: true,
        publishedAt: data.isApproved ? new Date() : null,
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
});
