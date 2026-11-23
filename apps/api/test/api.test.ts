import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';

const app = createApp();

describe('Serviqa API Integration Tests', () => {
  let customerToken: string;
  let providerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Authenticate Customer
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul.sharma@example.com', password: 'password123' });
    expect(custRes.status).toBe(200);
    customerToken = custRes.body.data.token;

    // 2. Authenticate Provider
    const provRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rajesh.ac@example.com', password: 'password123' });
    expect(provRes.status).toBe(200);
    providerToken = provRes.body.data.token;

    // 3. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@serviqa.com', password: 'admin123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/categories returns categories with dynamic form fields', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);

    const acCategory = res.body.data.find((c: any) => c.slug === 'ac-repair');
    expect(acCategory).toBeDefined();
    expect(acCategory.fields.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('rahul.sharma@example.com');
  });

  it('Blocks unauthorized access without Bearer token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('Blocks non-admin from admin analytics endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('Admin can view business analytics dashboard with real aggregates', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.totalCustomers).toBeGreaterThan(0);
    expect(res.body.data.financials.grossBookingValue).toBeGreaterThan(0);
  });

  it('Provider can view transparent reward score breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/rewards/my-score')
      .set('Authorization', `Bearer ${providerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.breakdown.jobsWeight).toBe('30%');
    expect(res.body.data.breakdown.ratingWeight).toBe('25%');
  });
});
