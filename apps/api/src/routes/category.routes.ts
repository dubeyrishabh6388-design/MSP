import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../middleware/error';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, ServiceWorkflowType } from '@prisma/client';

export const categoryRouter = Router();

// GET all active categories with dynamic fields and subcategories
categoryRouter.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' },
        },
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// GET single category by slug
categoryRouter.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: req.params.slug },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' },
        },
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        commissionRules: true,
      },
    });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  icon: z.string().default('Wrench'),
  workflowType: z.enum([
    ServiceWorkflowType.FIXED_PRICE,
    ServiceWorkflowType.INSPECTION_FIRST,
    ServiceWorkflowType.CUSTOM_QUOTATION,
    ServiceWorkflowType.RECURRING,
  ]),
  basePrice: z.number().int().min(0).default(0),
  inspectionFee: z.number().int().min(0).default(0),
  commissionRate: z.number().min(0).max(100).default(10.0),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
    helperText: z.string().optional(),
    sortOrder: z.number().default(0),
  })).optional(),
});

// POST Admin: create category
categoryRouter.post('/', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const data = categorySchema.parse(req.body);

    const existing = await prisma.serviceCategory.findFirst({
      where: { OR: [{ name: data.name }, { slug: data.slug }] },
    });
    if (existing) {
      throw new ApiError(400, 'Category with this name or slug already exists');
    }

    const { fields, ...categoryData } = data;

    const result = await prisma.$transaction(async (tx) => {
      const cat = await tx.serviceCategory.create({
        data: categoryData,
      });

      if (fields && fields.length > 0) {
        for (const field of fields) {
          await tx.categoryFieldDefinition.create({
            data: {
              categoryId: cat.id,
              ...field,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'CREATE_CATEGORY',
          resource: 'ServiceCategory',
          details: { categoryId: cat.id, name: cat.name },
        },
      });

      return cat;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// PUT Admin: update category
categoryRouter.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const { fields, ...categoryData } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.serviceCategory.update({
        where: { id: req.params.id },
        data: categoryData,
      });

      if (fields && Array.isArray(fields)) {
        await tx.categoryFieldDefinition.deleteMany({
          where: { categoryId: req.params.id },
        });

        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await tx.categoryFieldDefinition.create({
            data: {
              categoryId: req.params.id,
              name: f.name,
              label: f.label,
              type: f.type,
              required: !!f.required,
              options: f.options,
              placeholder: f.placeholder,
              sortOrder: i,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'UPDATE_CATEGORY',
          resource: 'ServiceCategory',
          details: { categoryId: cat.id, updates: categoryData },
        },
      });

      return cat;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
