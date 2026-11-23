import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const notificationRouter = Router();

// GET user notifications
notificationRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

// PUT mark notification as read
notificationRouter.put('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PUT mark all as read
notificationRouter.put('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});
