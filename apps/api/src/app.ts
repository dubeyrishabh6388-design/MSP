import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { authRouter } from './routes/auth.routes';
import { categoryRouter } from './routes/category.routes';
import { serviceAreaRouter } from './routes/service-area.routes';
import { requestRouter } from './routes/request.routes';
import { quotationRouter } from './routes/quotation.routes';
import { bookingRouter } from './routes/booking.routes';
import { providerRouter } from './routes/provider.routes';
import { rewardRouter } from './routes/reward.routes';
import { reviewRouter } from './routes/review.routes';
import { complaintRouter } from './routes/complaint.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { notificationRouter } from './routes/notification.routes';
import { adminRouter } from './routes/admin.routes';
import { addressRouter } from './routes/address.routes';

export function createApp(): Express {
  const app = express();

  // Ensure upload directory exists
  const uploadDir = path.resolve(config.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Security Middlewares
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: '*', // Allow local frontend during development
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads
  app.use('/uploads', express.static(uploadDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Serviqa Marketplace API', timestamp: new Date().toISOString() });
  });

  // OpenAPI spec minimal endpoint
  app.get('/api/v1/openapi.json', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'Serviqa Multi-Service Marketplace API',
        version: '1.0.0',
        description: 'Production-ready REST API for Serviqa multi-service marketplace platform',
      },
      paths: {
        '/api/v1/auth/register': { post: { summary: 'User Registration' } },
        '/api/v1/auth/login': { post: { summary: 'User Login' } },
        '/api/v1/categories': { get: { summary: 'List Categories with Dynamic Fields' } },
        '/api/v1/service-requests': { post: { summary: 'Create Service Request' }, get: { summary: 'List Requests' } },
        '/api/v1/quotations': { post: { summary: 'Submit Quotation' } },
        '/api/v1/bookings': { get: { summary: 'List Bookings' } },
        '/api/v1/analytics/dashboard': { get: { summary: 'Business Analytics' } },
      },
    });
  });

  // API v1 Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/service-areas', serviceAreaRouter);
  app.use('/api/v1/service-requests', requestRouter);
  app.use('/api/v1/quotations', quotationRouter);
  app.use('/api/v1/bookings', bookingRouter);
  app.use('/api/v1/providers', providerRouter);
  app.use('/api/v1/rewards', rewardRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/complaints', complaintRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/notifications', notificationRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/addresses', addressRouter);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
