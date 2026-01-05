import { z } from 'zod';
import { insertReportSchema, plates, reports, analyzeImageSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  plates: {
    list: {
      method: 'GET' as const,
      path: '/api/plates',
      input: z.object({
        sort: z.enum(['worst', 'recent', 'popular']).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof plates.$inferSelect & { reportCount: number; averageRating: number | null }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/plates/:id',
      responses: {
        200: z.custom<typeof plates.$inferSelect & { reports: typeof reports.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/plates/analyze',
      input: analyzeImageSchema,
      responses: {
        200: z.object({ licenseNumber: z.string() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  reports: {
    create: {
      method: 'POST' as const,
      path: '/api/reports',
      input: insertReportSchema.extend({
        licenseNumber: z.string().min(1),
      }),
      responses: {
        201: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/reports',
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
