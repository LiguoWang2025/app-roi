import { z } from 'zod';

function coerceArray(val: unknown): string[] | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (Array.isArray(val)) return val;
  return [String(val)];
}

export const roiQuerySchema = z.object({
  app_id: z.preprocess(
    coerceArray,
    z.array(z.enum(['App-1', 'App-2', 'App-3', 'App-4', 'App-5'])).optional(),
  ),
  country: z.preprocess(
    coerceArray,
    z.array(z.enum(['US', 'UK'])).optional(),
  ),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  roi_period: z.enum(['0d', '1d', '3d', '7d', '14d', '30d', '60d', '90d']),
  ma_days: z.coerce.number().int().min(1).max(30).default(7),
});

export type RoiQuery = z.infer<typeof roiQuerySchema>;
