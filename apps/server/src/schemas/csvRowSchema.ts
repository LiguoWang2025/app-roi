import { z } from 'zod';

const COUNTRY_MAP: Record<string, string> = {
  '美国': 'US',
  '英国': 'UK',
};

export const VALID_COUNTRIES_CN = Object.keys(COUNTRY_MAP);
export const VALID_COUNTRIES_EN = Object.values(COUNTRY_MAP);

export function mapCountry(cn: string): string {
  return COUNTRY_MAP[cn] ?? cn;
}

export const csvRowSchema = z.object({
  stat_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  app_id: z.enum(['App-1', 'App-2', 'App-3', 'App-4', 'App-5']),
  bid_type: z.string().min(1),
  country: z.enum(['US', 'UK']),
  installs: z.number().int().min(0),
  roi_0d: z.number(),
  roi_1d: z.number(),
  roi_3d: z.number(),
  roi_7d: z.number(),
  roi_14d: z.number(),
  roi_30d: z.number(),
  roi_60d: z.number(),
  roi_90d: z.number(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;
